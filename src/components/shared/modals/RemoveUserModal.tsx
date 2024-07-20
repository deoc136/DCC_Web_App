'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Button, { Variant } from '../Button';
import DatePicker from '@/components/inputs/DatePicker';
import TimePicker from '@/components/inputs/TimePicker';
import { today as getToday } from '@internationalized/date';
import { DateValue } from 'react-aria';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import axios from 'axios';
import { RemoveUserInputType } from '@/app/api/removeUser/route';
import { ClearRounded } from '@mui/icons-material';
import { InsertMethodResponse } from '@/types/general';
import { timezone } from '@/lib/utils';

interface IRemoveUserModal {
   isOpen: boolean;
   id: number;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   slug: string;
}

export default function RemoveUserModal({
   isOpen,
   id,
   setIsOpen,
   slug,
}: IRemoveUserModal) {
   const today = getToday(timezone);

   const [removalDate, setRemovalDate] = useState<DateValue>(today);
   const [removalHour, setRemovalHour] = useState<string>();

   const [actionError, setActionError] = useState<string>();
   const [sending, setSending] = useState(false);

   const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

   useEffect(() => {
      setRemovalHour(undefined);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [removalDate]);

   const isDisabled = sending || !removalHour || removalDate.compare(today) < 0;

   async function remove() {
      if (isDisabled) return;

      try {
         setActionError(undefined);
         setSending(true);

         const aux = removalDate.toDate(timezone);

         aux.setSeconds(0);
         aux.setMinutes(0);
         aux.setMilliseconds(0);
         aux.setHours(Number(removalHour) ?? 0);

         await axios.post<InsertMethodResponse>(
            '/api/removeUser',
            {
               id: id,
               deletion_date: aux,
               slug,
            } satisfies RemoveUserInputType,
            { baseURL: '' },
         );

         setRemovalDate(today);
         setRemovalHour(undefined);

         setIsOpen(false);
      } catch (error) {
         setActionError('Ocurrió un error inesperado');
      }

      setIsConfirmationOpen(false);
      setSending(false);
   }

   return (
      <>
         <ConfirmRemovalModal
            isOpen={isConfirmationOpen}
            remove={remove}
            sending={sending}
            setIsOpen={setIsConfirmationOpen}
         />
         <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
            {() => (
               <Dialog className="flex flex-col gap-14 rounded-xl p-7 ">
                  <div className="flex items-center">
                     <h3 className="text-xl">Retirar usuario</h3>
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
                        value={removalDate}
                        onChange={val => setRemovalDate(val)}
                        label="Retirar a partir de"
                        minValue={today}
                     />
                     <TimePicker
                        start_hour={
                           removalDate.compare(today) === 0
                              ? new Date().getHours()
                              : undefined
                        }
                        selectedKey={removalHour ?? null}
                        onSelectionChange={val =>
                           val && setRemovalHour(val.toString())
                        }
                        label="Hora"
                        placeholder="7:00AM"
                     />
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
                     <Button
                        onPress={() => setIsConfirmationOpen(true)}
                        isDisabled={isDisabled}
                     >
                        {sending ? (
                           <>
                              Cargando...
                              <RefreshRoundedIcon className="animate-spin" />
                           </>
                        ) : (
                           <>Retirar usuario</>
                        )}
                     </Button>
                  </div>
               </Dialog>
            )}
         </ModalTrigger>
      </>
   );
}

interface IConfirmRemovalModal {
   remove: () => Promise<void>;
   sending: boolean;
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

function ConfirmRemovalModal({
   isOpen,
   remove,
   sending,
   setIsOpen,
}: IConfirmRemovalModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <div className="aspect-square rounded-full bg-error p-3">
                  <ClearRounded className="!text-6xl text-white" />
               </div>
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Estás seguro de que quieres retirar a este usuario <br />
                     del sistema?
                  </h3>
                  <p className="text-center !font-normal text-on-background-text">
                     Este usuario no podrá tener acceso al sistema y ya no
                     podrás asignarle <br /> servicios, pero sus datos y su
                     historial de trabajo quedará en el sistema <br /> hasta que
                     se cumpla la fecha limite.
                  </p>
               </div>
               <div className="flex w-full gap-4">
                  <Button
                     isDisabled={sending}
                     onPress={() => setIsOpen(false)}
                     variant={Variant.secondary}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={sending} onPress={remove}>
                     {sending ? (
                        <>
                           Retirando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        'Retirar'
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
