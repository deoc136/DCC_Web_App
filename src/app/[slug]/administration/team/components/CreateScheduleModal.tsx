'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Catalog } from '@/types/catalog';
import { Schedule } from '../create/views/CreationView';
import ScheduleForm from './ScheduleForm';

interface ICreateScheduleModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   setSchedules: Dispatch<SetStateAction<Schedule[]>>;
}

const initialValues = {
   work_days: [] as string[],
   hours: [
      {
         start_hour: null,
         end_hour: null,
      },
   ] as {
      start_hour: Catalog | null;
      end_hour: Catalog | null;
   }[],
};

export type PopulatedSchedule = typeof initialValues;

export default function CreateScheduleModal({
   isOpen,
   setIsOpen,
   setSchedules,
}: ICreateScheduleModal) {
   const [values, setValues] = useState(initialValues);

   useEffect(() => {
      setValues(initialValues);
   }, [isOpen]);

   const isDisabled =
      !values.hours.length ||
      !values.work_days.length ||
      values.hours.some(
         ({ start_hour, end_hour }) => start_hour === null || end_hour === null,
      );

   function create() {
      if (isDisabled) return;

      setSchedules(prev => [
         ...prev,
         {
            work_days: values.work_days,
            hours: values.hours.map(({ start_hour, end_hour }) => ({
               start_hour: start_hour?.code ?? '',
               end_hour: end_hour?.code ?? '',
            })),
         },
      ]);

      setIsOpen(false);
      setValues(initialValues);
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-6 rounded-xl p-7 ">
               <div className="flex min-w-[40vw] items-center justify-between">
                  <h2 className="text-2xl font-semibold">Añadir horario</h2>
                  <Button
                     className="!w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <ScheduleForm values={values} setValues={setValues} />
               <div className="flex gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                        setValues(initialValues);
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={isDisabled} onPress={create}>
                     Agregar
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
