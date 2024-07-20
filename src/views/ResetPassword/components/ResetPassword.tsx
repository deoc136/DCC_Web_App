'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import useDictionary from '@/lib/hooks/useDictionary';
import { RefreshRounded } from '@mui/icons-material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBack';
import { Dispatch, SetStateAction, useState } from 'react';
import { useKeyboard } from 'react-aria';

interface IResetPassword {
   code: string;
   setCode: Dispatch<SetStateAction<string>>;
   password: string;
   setPassword: Dispatch<SetStateAction<string>>;
   passwordConfirmation: string;
   setPasswordConfirmation: Dispatch<SetStateAction<string>>;
   error: string | undefined;
   reset: (
      setLoading?: Dispatch<SetStateAction<boolean>> | undefined,
   ) => Promise<void>;
   goBack: () => any;
}

export default function ResetPassword({
   code,
   password,
   passwordConfirmation,
   error,
   goBack,
   reset,
   setCode,
   setPassword,
   setPasswordConfirmation,
}: IResetPassword) {
   const dic = useDictionary();

   const [loading, setLoading] = useState(false);

   const { keyboardProps } = useKeyboard({
      onKeyDown: ({ key }) => {
         if (key.toLowerCase() === 'enter') {
            reset();
         }
      },
   });

   return (
      <>
         <div {...keyboardProps} className="my-32 flex flex-col gap-5 sm:my-0">
            <TextField
               value={code}
               onChange={setCode}
               type="password"
               label={dic.texts.flows.verification_code}
               placeholder={dic.inputs.enter_code}
            />
            <TextField
               value={password}
               onChange={setPassword}
               type="password"
               label={dic.texts.users.password}
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
         <div className="mt-9 grid h-min grid-cols-[2fr_3fr] gap-5">
            <Button
               onPressStart={goBack}
               variant={Variant.secondary}
               onPress={() => reset(setLoading)}
            >
               <ArrowBackRoundedIcon height={16} /> {dic.texts.flows.back}
            </Button>
            <Button
               variant={Variant.primary}
               onPress={() => reset(setLoading)}
               isDisabled={
                  !code.length ||
                  !password.length ||
                  !passwordConfirmation.length ||
                  password !== passwordConfirmation ||
                  loading
               }
            >
               {loading ? (
                  <>
                     {dic.texts.flows.loading}...
                     <RefreshRounded className="animate-spin" />
                  </>
               ) : (
                  dic.texts.flows.change_password
               )}
            </Button>
         </div>
      </>
   );
}
