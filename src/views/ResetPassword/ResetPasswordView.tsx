'use client';

import {
   enterPasswordResetCode,
   sendPasswordResetCode,
} from '@/lib/actions/reset-password';
import { translateError } from '@/lib/amplify_aux/error_messages';
import { password_regex } from '@/lib/utils';
import { IAmplifyError } from '@/types/amplify';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { z } from 'zod';
import SuccessModal from './components/SuccessModal';
import { GlobalRoute, SORoutes } from '@/lib/routes';
import SendPasswordCode from './components/SendPasswordCode';
import ResetPassword from './components/ResetPassword';
import { invalidEmailMessage } from '@/lib/validations';
import MobileAuthHeader from '@/components/shared/MobileAuthHeader';
import useDictionary from '@/lib/hooks/useDictionary';

enum State {
   sending,
   resetting,
}

const mailSchema = z.string().email();
const passwordSchema = z.string().regex(new RegExp(password_regex));

interface IResetPasswordGeneralView {
   redirectionRoute: GlobalRoute;
   imgSrc: string;
   slug: string;
}

export default function ResetPasswordGeneralView({
   redirectionRoute,
   imgSrc,
   slug,
}: IResetPasswordGeneralView) {
   const dic = useDictionary();

   const searchParams = useSearchParams();
   const step = searchParams.get('step');
   const baseEmail = searchParams.get('email');

   const router = useRouter();

   const [email, setEmail] = useState(baseEmail ?? '');
   const [code, setCode] = useState('');
   const [errorSending, setErrorSending] = useState<string>();
   const [errorResetting, setErrorResetting] = useState<string>();

   const [newPassword, setNewPassword] = useState('');
   const [passwordConfirmation, setPasswordConfirmation] = useState('');

   const [state, setState] = useState(
      step === '2' ? State.resetting : State.sending,
   );

   const [isChanged, setIsChanged] = useState(false);

   async function send(setLoading?: Dispatch<SetStateAction<boolean>>) {
      const parsing = mailSchema.safeParse(email);

      if (!parsing.success) {
         setErrorSending(invalidEmailMessage);
         return;
      }

      setLoading?.(true);

      try {
         await sendPasswordResetCode(email, slug);

         setState(State.resetting);
         setLoading?.(false);
      } catch (error) {
         setLoading?.(false);
         setErrorSending(translateError(error as IAmplifyError));
      }
   }

   async function reset(setLoading?: Dispatch<SetStateAction<boolean>>) {
      setErrorResetting(undefined);

      const parsing = passwordSchema.safeParse(newPassword);

      if (!parsing.success) {
         setErrorResetting(
            'La contraseña debe tener al menos una letra mayúscula, una minúscula, un numero y un caracter especial.',
         );
         return;
      }

      setLoading?.(true);

      try {
         await enterPasswordResetCode(email, code.trim(), newPassword);

         setIsChanged(true);
      } catch (error) {
         setLoading?.(false);
         setErrorResetting(translateError(error as IAmplifyError));
      }
   }

   const hiddenEmail = (() => {
      const firstPart = `${email.split('@').at(0)?.at(0)}***@`;

      const aux = email.split('@');

      aux.splice(0, 1, firstPart);

      return aux;
   })();

   useEffect(() => {
      setCode('');
      setErrorSending(undefined);
      setErrorResetting(undefined);
      setNewPassword('');
      setPasswordConfirmation('');
   }, [state]);

   return (
      <div className="text-sm sm:text-base">
         <SuccessModal
            isOpen={isChanged}
            action={() => router.push(redirectionRoute)}
         />
         <div className="grid h-full sm:grid-rows-auth-disposition">
            <div className="relative hidden aspect-video w-40 sm:block">
               <Image
                  alt="clinic logo"
                  src={imgSrc}
                  className="object-contain object-bottom"
                  fill
               />
            </div>
            <MobileAuthHeader title={dic.pages.auth.reset_password.title} />
            <div />
            {(() => {
               switch (state) {
                  case State.sending:
                     return (
                        <>
                           <div className="sm:mb-20">
                              <h1 className="mb-8 hidden text-[1.75rem] font-semibold sm:block">
                                 {dic.pages.auth.reset_password.title}
                              </h1>
                              <h3 className="mb-4 text-lg font-semibold text-on-background-light sm:text-xl">
                                 {
                                    dic.pages.auth.reset_password.send_code
                                       .sub_title
                                 }
                              </h3>
                              <p className="text-on-background-light sm:mb-6">
                                 {
                                    dic.pages.auth.reset_password.send_code
                                       .description
                                 }
                              </p>
                           </div>
                           <SendPasswordCode
                              email={email}
                              error={errorSending}
                              send={send}
                              setEmail={setEmail}
                           />
                        </>
                     );
                  default:
                     return (
                        <>
                           <div className="sm:mb-20">
                              <h1 className="mb-8 hidden text-[1.75rem] font-semibold sm:block">
                                 {dic.pages.auth.reset_password.title}
                              </h1>
                              <h2 className="mb-4 text-lg font-semibold text-on-background-light sm:text-xl">
                                 {
                                    dic.pages.auth.reset_password.set_password
                                       .sub_title
                                 }
                              </h2>
                              <p className="text-on-background-light sm:mb-6">
                                 {
                                    dic.pages.auth.reset_password.set_password
                                       .description_1
                                 }{' '}
                                 {hiddenEmail}.
                                 <br className="hidden sm:block" />
                                 <br className="hidden sm:block" />
                                 <span className="hidden sm:block">
                                    {
                                       dic.pages.auth.reset_password
                                          .set_password.description_2
                                    }
                                 </span>
                              </p>
                           </div>
                           <ResetPassword
                              password={newPassword}
                              passwordConfirmation={passwordConfirmation}
                              setPassword={setNewPassword}
                              setPasswordConfirmation={setPasswordConfirmation}
                              goBack={() => setState(State.sending)}
                              code={code}
                              error={errorResetting}
                              reset={reset}
                              setCode={setCode}
                           />
                        </>
                     );
               }
            })()}
         </div>
      </div>
   );
}
