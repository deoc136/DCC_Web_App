'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import useDictionary from '@/lib/hooks/useDictionary';
import { RefreshRounded } from '@mui/icons-material';
import { Dispatch, SetStateAction } from 'react';
import { useKeyboard } from 'react-aria';

interface IActivateStep {
   keyboardProps: ReturnType<typeof useKeyboard>['keyboardProps'];
   setEmail: Dispatch<SetStateAction<string>>;
   error: string | undefined;
   setCode: Dispatch<SetStateAction<string>>;
   send: () => Promise<void>;
   email: string;
   code: string;
   loading: boolean;
   timer: number | undefined;
   resendCode: () => Promise<void>;
}

export default function ActivateStep({
   keyboardProps,
   setEmail,
   error,
   setCode,
   send,
   email,
   code,
   loading,
   timer,
   resendCode,
}: IActivateStep) {
   const dic = useDictionary();

   return (
      <>
         <div />
         <div className="sm:mb-20">
            <h1 className="hidden text-[1.75rem] font-semibold sm:mb-8 sm:block">
               {dic.pages.auth.activate_account.code_flow.title}
            </h1>
            <p className="text-on-background-light sm:mb-6">
               {dic.pages.auth.activate_account.code_flow.description}
            </p>
         </div>
         <div {...keyboardProps} className="my-36 flex flex-col gap-5 sm:my-0">
            <TextField
               onChange={setEmail}
               value={email}
               type="text"
               label={dic.texts.users.email}
               placeholder={dic.inputs.enter_email}
            />
            <TextField
               errorMessage={error}
               onChange={setCode}
               value={code}
               type="text"
               label={dic.texts.flows.verification_code}
               placeholder={dic.inputs.enter_code}
            />
         </div>
         <div />
         <div className="grid gap-5 sm:gap-10">
            <Button
               variant={Variant.primary}
               onPress={send}
               isDisabled={!email.length || !code.length || loading}
               className="mt-9"
            >
               {loading ? (
                  <>
                     {dic.texts.flows.loading}...
                     <RefreshRounded className="animate-spin" />
                  </>
               ) : (
                  dic.texts.flows.continue
               )}
            </Button>
            <Button
               isDisabled={loading || timer !== undefined}
               onPress={resendCode}
               className="!w-max justify-self-center bg-transparent !p-0 text-center !text-secondary underline"
            >
               {timer !== undefined
                  ? `${
                       dic.pages.auth.activate_account.code_flow.resend_code_in
                    } ${
                       60 - timer
                    } ${dic.texts.attributes.seconds?.toLowerCase()}.`
                  : dic.pages.auth.activate_account.code_flow.resend_code}
            </Button>
         </div>
      </>
   );
}
