'use client';

import Button from '@/components/shared/Button';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { NewUser } from '@/types/user';
import { useState } from 'react';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface IServicePreviewRow {
   date: string;
   hour: string;
   therapist?: NewUser;
   index: number;
}

export default function ServicePreviewRow({
   date,
   hour,
   therapist,
   index,
}: IServicePreviewRow) {
   const dic = useDictionary();

   const phoneCode = usePhoneCode();
   const [isOpen, setIsOpen] = useState(false);

   return (
      <article>
         <Button
            onPress={() => setIsOpen(prev => !prev)}
            className={`grid grid-cols-[auto_auto_1fr_auto] items-end gap-2 !rounded-none border-b border-on-background-disabled bg-transparent !p-0 !py-5 ${
               isOpen ? '!text-secondary' : '!text-on-background-text'
            }`}
         >
            {isOpen ? (
               <KeyboardArrowUpRoundedIcon />
            ) : (
               <KeyboardArrowDownRoundedIcon />
            )}
            <h4 className="text-base font-semibold">
               {dic.texts.various.session} {index + 1}
            </h4>
            <div />
         </Button>
         {isOpen && (
            <div className="grid grid-cols-2 gap-5 p-7">
               <div>
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.date}
                  </p>
                  <p className="text-on-background-text">{date}</p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.hour}
                  </p>
                  <p className="text-on-background-text">{hour}</p>
               </div>
               <div className="col-span-2">
                  <p className="mb-2 font-semibold">
                     {dic.texts.attributes.therapist}
                  </p>
                  <div>
                     {therapist && (
                        <UserOverviewCard user={therapist} code={phoneCode} />
                     )}
                  </div>
               </div>
            </div>
         )}
      </article>
   );
}
