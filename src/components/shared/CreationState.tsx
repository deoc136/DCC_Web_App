'use client';

import { Fragment } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface ICreationState {
   state: number;
   steps: {
      name: string;
      state: number;
   }[];
   className?: string;
}

export default function CreationState({
   state,
   steps,
   className,
}: ICreationState) {
   const dic = useDictionary();

   const currentState = steps.find(step => step.state === state);

   return (
      <>
         <div className="mb-16 hidden w-full lg:block">
            <div className={`m-auto grid ${className}`}>
               {steps.map((step, i) => (
                  <Fragment key={i}>
                     <div
                        className={`${
                           step.state <= state
                              ? 'text-secondary'
                              : 'text-on-background-disabled'
                        } relative flex flex-col items-center gap-2`}
                     >
                        <div
                           className={`${
                              step.state <= state
                                 ? 'bg-secondary'
                                 : 'bg-on-background-disabled'
                           } grid aspect-square w-8 place-items-center rounded-full text-white`}
                        >
                           {step.state >= state ? (
                              i + 1
                           ) : (
                              <CheckRoundedIcon className="!fill-white" />
                           )}
                        </div>
                        <div>
                           {dic.texts.various.step} {i + 1}
                        </div>
                        <div className="absolute top-[calc(100%_+_.5rem)] w-max font-semibold">
                           {step.name}
                        </div>
                     </div>
                     {i < steps.length - 1 && (
                        <div className="relative mt-4 h-1 w-full">
                           <div className="absolute inset-0 w-full rounded-full bg-on-background-disabled" />
                           <div
                              className={`${
                                 step.state < state ? 'w-full' : 'w-0'
                              } absolute inset-0 rounded-full bg-secondary transition-all`}
                           />
                        </div>
                     )}
                  </Fragment>
               ))}
            </div>
         </div>
         <div className="lg:hidden">
            <div className="relative flex items-center gap-5 text-secondary">
               <div className="grid aspect-square h-8 w-8 place-items-center rounded-full bg-secondary text-white">
                  {(currentState?.state ?? 0) + 1}
               </div>
               <div>
                  <p className="text-xs">
                     {dic.texts.various.step} {(currentState?.state ?? 0) + 1}{' '}
                     {dic.texts.various.of?.toLowerCase()} {steps.length}
                  </p>
                  <p className="w-max text-sm font-semibold">
                     {currentState?.name}
                  </p>
               </div>
            </div>
            <div className="relative mt-5 h-1 w-full">
               <div className="absolute inset-0 w-full rounded-full bg-on-background-disabled" />
               <div
                  style={{
                     width: `${(((state ?? 0) + 1) * 100) / steps.length}%`,
                  }}
                  className="absolute inset-0 rounded-full bg-secondary transition-all"
               />
            </div>
         </div>
      </>
   );
}
