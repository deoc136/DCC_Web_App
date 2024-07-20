'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Button, { Variant } from '../Button';
import DatePicker from '@/components/inputs/DatePicker';
import TimePicker from '@/components/inputs/TimePicker';
import { today as getToday } from '@internationalized/date';
import { DateValue } from 'react-aria';
import Checkbox from '../Checkbox';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import axios from 'axios';
import { DeactivateUserInputType } from '@/app/api/deactivateUser/route';
import { InsertMethodResponse } from '@/types/general';
import { timezone } from '@/lib/utils';

interface IDeactivateUserModal {
   isOpen: boolean;
   id: number;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   slug: string;
}

export default function DeactivateUserModal({
   isOpen,
   id,
   setIsOpen,
   slug,
}: IDeactivateUserModal) {
   const today = getToday(timezone);

   const [deactivationDate, setDeactivationDate] = useState<DateValue>(today);
   const [deactivationHour, setDeactivationHour] = useState<string>();

   const [activate, setActivate] = useState(false);

   const [activationDate, setActivationDate] = useState<DateValue>();
   const [activationHour, setActivationHour] = useState<string>();

   const [actionError, setActionError] = useState<string>();
   const [sending, setSending] = useState(false);

   useEffect(() => {
      setDeactivationHour(undefined);
      setActivationHour(undefined);

      activationDate &&
         deactivationDate.compare(activationDate) > 0 &&
         setActivationDate(undefined);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [deactivationDate]);

   useEffect(() => {
      activationDate &&
         deactivationDate.compare(activationDate) === 0 &&
         deactivationHour! >= activationHour! &&
         setActivationHour(undefined);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [deactivationHour]);

   useEffect(() => {
      setActivationDate(undefined);
      setActivationHour(undefined);
   }, [activate]);

   const isDisabled =
      sending ||
      !deactivationHour ||
      deactivationDate.compare(today) < 0 ||
      (activate &&
         (!activationDate ||
            !activationHour ||
            deactivationDate.compare(activationDate) > 0));

   async function deactivate() {
      if (isDisabled) return;

      try {
         setActionError(undefined);
         setSending(true);

         const aux_1 = deactivationDate.toDate(timezone);

         aux_1.setSeconds(0);
         aux_1.setMinutes(0);
         aux_1.setMilliseconds(0);
         aux_1.setHours(Number(deactivationHour) ?? 0);

         if (activate && activationDate && activationHour) {
            const aux_2 = activationDate.toDate(timezone);

            aux_2.setSeconds(0);
            aux_2.setMinutes(0);
            aux_2.setMilliseconds(0);
            aux_2.setHours(Number(activationHour) ?? 0);

            await axios.post<InsertMethodResponse>(
               '/api/deactivateUser',
               {
                  id: id,
                  deactivation_date: aux_1,
                  activation_date: aux_2,
                  slug,
               } satisfies DeactivateUserInputType,
               { baseURL: '' },
            );
         } else {
            await axios.post<InsertMethodResponse>(
               '/api/deactivateUser',
               {
                  id: id,
                  deactivation_date: aux_1,
                  slug,
               } satisfies DeactivateUserInputType,
               { baseURL: '' },
            );
         }

         setDeactivationDate(today);
         setDeactivationHour(undefined);
         setActivationDate(undefined);
         setActivationHour(undefined);

         setIsOpen(false);
      } catch (error) {
         setActionError('Ocurrió un error inesperado');
      }

      setSending(false);
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-14 rounded-xl p-7 ">
               <div className="flex items-center">
                  <h3 className="text-xl">Inactivar usuario</h3>
                  <Button
                     className="ml-auto !w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <div className="grid grid-cols-2 gap-5">
                  <DatePicker
                     value={deactivationDate}
                     onChange={val => setDeactivationDate(val)}
                     label="Inactivar a partir de"
                     minValue={today}
                  />
                  <TimePicker
                     start_hour={
                        deactivationDate.compare(today) === 0
                           ? new Date().getHours()
                           : undefined
                     }
                     selectedKey={deactivationHour ?? null}
                     onSelectionChange={val =>
                        val && setDeactivationHour(val.toString())
                     }
                     label="Hora"
                     placeholder="7:00AM"
                  />
                  <div className="col-span-2">
                     <Checkbox
                        className="w-max"
                        isSelected={activate}
                        onChange={setActivate}
                     >
                        Programar activación
                     </Checkbox>
                  </div>
                  {activate && (
                     <>
                        <DatePicker
                           value={activationDate ?? null}
                           onChange={val => setActivationDate(val)}
                           label="Activar a partir de"
                           minValue={deactivationDate}
                        />
                        <TimePicker
                           isDisabled={!deactivationHour || !activationDate}
                           start_hour={
                              activationDate?.compare(deactivationDate) === 0
                                 ? Number(deactivationHour) ?? undefined
                                 : undefined
                           }
                           selectedKey={activationHour ?? null}
                           onSelectionChange={val =>
                              val && setActivationHour(val.toString())
                           }
                           label="Hora"
                           placeholder="7:00AM"
                        />
                     </>
                  )}
               </div>
               <div className="grid grid-cols-2 gap-5">
                  {actionError && (
                     <div className="col-span-2 text-end text-error">
                        {actionError}
                     </div>
                  )}
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button onPress={deactivate} isDisabled={isDisabled}>
                     {sending ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        <>Inactivar usuario</>
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
