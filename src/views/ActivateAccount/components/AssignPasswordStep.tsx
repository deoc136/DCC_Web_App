'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useKeyboard } from 'react-aria';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Dispatch, SetStateAction } from 'react';
import { ActivateAccountState } from '../ActivateAccountView';
import useDictionary from '@/lib/hooks/useDictionary';
import { RefreshRounded } from '@mui/icons-material';

interface IAssignPasswordStep {
   keyboardProps: ReturnType<typeof useKeyboard>['keyboardProps'];
   password: string;
   setPassword: Dispatch<SetStateAction<string>>;
   passwordConfirmation: string;
   setPasswordConfirmation: Dispatch<SetStateAction<string>>;
   error: string | undefined;
   loading: boolean;
   send: () => Promise<void>;
   setState: Dispatch<SetStateAction<ActivateAccountState>>;
}

export default function AssignPasswordStep({
   keyboardProps,
   password,
   setPassword,
   passwordConfirmation,
   setPasswordConfirmation,
   error,
   loading,
   send,
   setState,
}: IAssignPasswordStep) {
   const dic = useDictionary();

   return (
      <>
         <div />
         <div className="sm:mb-20">
            <h1 className="hidden text-[1.75rem] font-semibold sm:mb-8 sm:block">
               {dic.pages.auth.activate_account.password_flow.title}
            </h1>
            <p className="text-on-background-light sm:mb-6">
               {dic.pages.auth.activate_account.password_flow.description}
            </p>
         </div>
         <div
            {...keyboardProps}
            className="my-36 flex flex-col gap-5 sm:my-0
         "
         >
            <TextField
               value={password}
               onChange={setPassword}
               type="password"
               label={dic.texts.users.new_password}
               placeholder={dic.inputs.enter_password}
            />
            <TextField
               value={passwordConfirmation}
               errorMessage={error}
               onChange={setPasswordConfirmation}
               type="password"
               label={dic.texts.users.confirm_password}
               placeholder={dic.inputs.enter_password}
            />
         </div>
         <div />
         <div className="mt-9 grid grid-cols-[2fr_3fr] gap-5">
            <Button
               className="flex items-center justify-center gap-1"
               variant={Variant.secondary}
               isDisabled={loading}
               onPress={() => setState(ActivateAccountState.activating)}
            >
               <ArrowBackRoundedIcon /> {dic.texts.flows.back}
            </Button>
            <Button
               variant={Variant.primary}
               onPress={send}
               isDisabled={
                  !password.length ||
                  !passwordConfirmation.length ||
                  loading ||
                  password !== passwordConfirmation
               }
            >
               {loading ? (
                  <>
                     {dic.texts.flows.loading}...
                     <RefreshRounded className="animate-spin" />
                  </>
               ) : (
                  dic.texts.flows.activate_account
               )}
            </Button>
         </div>
      </>
   );
}
