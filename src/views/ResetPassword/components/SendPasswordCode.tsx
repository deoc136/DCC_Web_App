'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import useDictionary from '@/lib/hooks/useDictionary';
import { RefreshRounded } from '@mui/icons-material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useKeyboard } from 'react-aria';

interface ISendPasswordCode {
   email: string;
   setEmail: Dispatch<SetStateAction<string>>;
   error: string | undefined;
   send: (
      setLoading?: Dispatch<SetStateAction<boolean>> | undefined,
   ) => Promise<void>;
   goBackUrl?: string;
}

export default function SendPasswordCode({
   email,
   error,
   setEmail,
   send,
   goBackUrl,
}: ISendPasswordCode) {
   const dic = useDictionary();

   const [loading, setLoading] = useState(false);

   const router = useRouter();

   const { keyboardProps } = useKeyboard({
      onKeyDown: ({ key }) => {
         if (key.toLowerCase() === 'enter') {
            send();
         }
      },
   });

   return (
      <>
         <div {...keyboardProps} className="my-36 flex flex-col gap-5 sm:my-0">
            <TextField
               value={email}
               errorMessage={error}
               onChange={setEmail}
               type="text"
               label={dic.texts.users.email}
               placeholder={dic.inputs.enter_email}
            />
         </div>
         <div />
         <div className="mt-9 grid h-min grid-cols-[2fr_3fr] gap-5">
            <Button
               onPressStart={() =>
                  goBackUrl ? router.push(goBackUrl) : router.back()
               }
               variant={Variant.secondary}
               onPress={() => send(setLoading)}
            >
               <ArrowBackRoundedIcon height={16} /> {dic.texts.flows.back}
            </Button>
            <Button
               variant={Variant.primary}
               onPress={() => send(setLoading)}
               isDisabled={!email.length || loading}
            >
               {loading ? (
                  <>
                     {dic.texts.flows.loading}...
                     <RefreshRounded className="animate-spin" />
                  </>
               ) : (
                  <>
                     {dic.texts.flows.continue}
                     <ArrowForwardRoundedIcon height={16} />
                  </>
               )}
            </Button>
         </div>
      </>
   );
}
