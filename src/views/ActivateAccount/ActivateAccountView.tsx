'use client';

import { translateError } from '@/lib/amplify_aux/error_messages';
import { IAmplifyError } from '@/types/amplify';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { GlobalRoute, clinicRoutes } from '@/lib/routes';
import { useKeyboard } from 'react-aria';
import Button, { Variant } from '@/components/shared/Button';
import {
   confirmSignUp,
   resendVerificationCode,
} from '@/lib/actions/confirm-signUp';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Image from 'next/image';
import ActivateStep from './components/ActivateStep';
import AssignPasswordStep from './components/AssignPasswordStep';
import { password_regex } from '@/lib/utils';
import { assignNewPassword } from '@/services/auth';
import { invalidEmailMessage } from '@/lib/validations';
import MobileAuthHeader from '@/components/shared/MobileAuthHeader';
import useDictionary from '@/lib/hooks/useDictionary';

const mailSchema = z.string().email();
const passwordSchema = z.string().regex(new RegExp(password_regex));

interface IActivateAccountView {
   loginRoute: GlobalRoute;
   imgSrc: string;
   slug: string;
}

export enum ActivateAccountState {
   activating,
   assigningPassword,
}

export default function ActivateAccountView({
   loginRoute,
   imgSrc,
   slug,
}: IActivateAccountView) {
   const dic = useDictionary();

   const [isLoading, setIsLoading] = useState(false);
   const [sendingCode, setSendingCode] = useState(false);

   const [timer, setTimer] = useState<number>();

   const [email, setEmail] = useState('');
   const [code, setCode] = useState('');

   const [password, setPassword] = useState('');
   const [passwordConfirmation, setPasswordConfirmation] = useState('');

   const [activationError, setActivationError] = useState<string>();
   const [error, setError] = useState<string>();

   const [isOpen, setIsOpen] = useState(false);

   const [state, setState] = useState(ActivateAccountState.activating);

   useEffect(() => {
      setActivationError(undefined);
      setError(undefined);
   }, [state]);

   const { keyboardProps } = useKeyboard({
      onKeyDown: ({ key }) => {
         if (key.toLowerCase() === 'enter') {
            activateAccount();
         }
      },
   });

   function beginTimer() {
      let seconds = 0;
      setTimer(seconds);

      const interval = setInterval(async () => {
         const returnIntervalAndStop = () => {
            clearInterval(interval);
            return undefined;
         };
         setTimer(() => (seconds === 60 ? returnIntervalAndStop() : seconds));
         seconds++;
      }, 1000);
   }

   async function resendCode() {
      if (sendingCode || timer !== undefined) return;

      setActivationError(undefined);

      const parsing = mailSchema.safeParse(email);

      if (!parsing.success) {
         setActivationError(invalidEmailMessage);
         return;
      }

      setSendingCode(true);

      try {
         await resendVerificationCode(email, slug);
         beginTimer();
      } catch (error) {
         setActivationError(
            translateError(error as IAmplifyError, 'activate-account'),
         );
      }
      setSendingCode(false);
   }

   async function activateAccount() {
      const parsing = mailSchema.safeParse(email);

      if (!parsing.success) {
         setActivationError(invalidEmailMessage);
         return;
      }

      setState(ActivateAccountState.assigningPassword);
   }

   async function assignPassword() {
      if (isLoading) return;

      setError(undefined);

      const parsing = passwordSchema.safeParse(password);

      if (!parsing.success) {
         setError(
            'La contraseña debe tener al menos una letra mayúscula, una minúscula, un numero y un caracter especial.',
         );
         return;
      }

      setIsLoading(true);

      try {
         await confirmSignUp({ email, code: code.trim() });
      } catch (error) {
         setError(translateError(error as IAmplifyError, 'activate-account'));
         setIsLoading(false);
         return;
      }

      try {
         await assignNewPassword(email, password);

         setIsOpen(true);
      } catch (error) {
         setError(translateError(error as IAmplifyError));
      }
      setIsLoading(false);
   }

   return (
      <div className="text-sm sm:text-base">
         <SuccessModal loginUrl={loginRoute} isOpen={isOpen} />
         <div className="grid h-full sm:grid-rows-auth-disposition">
            <MobileAuthHeader
               title={dic.pages.auth.activate_account.code_flow.title}
            />
            <div className="relative hidden aspect-video w-40 sm:block">
               <Image
                  alt="clinic logo"
                  src={imgSrc}
                  className="object-contain object-bottom"
                  fill
               />
            </div>
            {state === ActivateAccountState.activating ? (
               <ActivateStep
                  {...{
                     code,
                     email,
                     error: activationError,
                     keyboardProps,
                     loading: sendingCode,
                     resendCode,
                     send: activateAccount,
                     setCode,
                     setEmail,
                     timer,
                  }}
               />
            ) : (
               <AssignPasswordStep
                  {...{
                     setState,
                     keyboardProps,
                     password,
                     setPassword,
                     passwordConfirmation,
                     setPasswordConfirmation,
                     error,
                     loading: isLoading,
                     send: assignPassword,
                  }}
               />
            )}
         </div>
      </div>
   );
}

function SuccessModal({
   isOpen,
   loginUrl,
}: {
   isOpen: boolean;
   loginUrl: string;
}) {
   const dic = useDictionary();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-base sm:text-xl">
                     {dic.pages.auth.activate_account.success_modal.title}
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     {dic.pages.auth.activate_account.success_modal.description}
                  </p>
               </div>
               <Button href={loginUrl} className="w-full sm:w-auto sm:!px-24">
                  {dic.pages.auth.activate_account.success_modal.go_to_login}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
