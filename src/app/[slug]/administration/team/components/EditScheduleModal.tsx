'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, SetStateAction, useState } from 'react';
import ScheduleForm from './ScheduleForm';
import { Schedule } from '../create/views/CreationView';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAppSelector } from '@/lib/hooks/redux-hooks';

interface IEditScheduleModal {
   initialValues: Schedule;
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   setSchedules: Dispatch<SetStateAction<Schedule[]>>;
   index: number;
}

export default function EditScheduleModal({
   initialValues,
   isOpen,
   setIsOpen,
   setSchedules,
   index,
}: IEditScheduleModal) {
   const { hours } = useAppSelector(store => store.catalogues);

   const [values, setValues] = useState({
      work_days: initialValues.work_days,
      hours: initialValues.hours.map(({ start_hour, end_hour }) => ({
         start_hour: hours.find(hour => hour.code === start_hour) ?? null,
         end_hour: hours.find(hour => hour.code === end_hour) ?? null,
      })),
   });

   const isDisabled =
      !values.hours.length ||
      !values.work_days.length ||
      values.hours.some(
         ({ start_hour, end_hour }) => start_hour === null || end_hour === null,
      );

   function edit() {
      if (isDisabled) return;

      setSchedules(prev => {
         const aux = [...prev];

         aux[index] = {
            work_days: values.work_days,
            hours: values.hours.map(({ start_hour, end_hour }) => ({
               start_hour: start_hour?.code ?? '',
               end_hour: end_hour?.code ?? '',
            })),
         };

         return aux;
      });

      setIsOpen(false);
   }

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-6 rounded-xl p-7 ">
               <div className="flex min-w-[40vw] items-center justify-between">
                  <h2 className="text-2xl font-semibold">Editar horario</h2>
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
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button isDisabled={isDisabled} onPress={edit}>
                     Guardar
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
