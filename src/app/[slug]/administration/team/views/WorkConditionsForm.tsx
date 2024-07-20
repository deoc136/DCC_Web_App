'use client';

import { Dispatch, Key, SetStateAction } from 'react';
import { z } from 'zod';
import { NewUser, Role } from '@/types/user';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { Headquarter } from '@/types/headquarter';
import Button, { Variant } from '@/components/shared/Button';
import { AddRounded } from '@mui/icons-material';
import { NewUserWithStrings, Schedule } from '../create/views/CreationView';
import ScheduleCard from '@/components/shared/cards/ScheduleCard';
import { Service } from '@/types/service';
import ServiceOverviewCard from '@/components/shared/cards/ServiceOverviewCard';

interface IWorkConditionsForm {
   values: NewUserWithStrings;
   setValues: Dispatch<SetStateAction<NewUserWithStrings>>;
   errors: z.ZodIssue[] | undefined;
   headquarters: Headquarter[];
   setCreatingSchedule: Dispatch<SetStateAction<boolean>>;
   setSelectingServices: Dispatch<SetStateAction<boolean>>;
   schedules: Schedule[];
   setSchedules: Dispatch<SetStateAction<Schedule[]>>;
   setEditingSchedule: Dispatch<SetStateAction<number | undefined>>;
   services: Service[];
   selectedServices: Key[];
   setSelectedServices: Dispatch<SetStateAction<Key[]>>;
   setDeletingService: Dispatch<SetStateAction<number | undefined>>;
}

export default function WorkConditionsForm({
   setValues,
   values,
   errors,
   headquarters,
   setCreatingSchedule,
   schedules,
   setSchedules,
   setEditingSchedule,
   setSelectingServices,
   services,
   selectedServices,
   setDeletingService,
}: IWorkConditionsForm) {
   function changeValue<T extends keyof NewUserWithStrings>(
      param: T,
      value: NewUserWithStrings[T],
   ) {
      setValues(prev => ({
         ...prev,
         [param]: value,
      }));
   }

   const roles: { role: Role; display_name: string }[] = [
      { role: 'RECEPTIONIST', display_name: 'Recepcionista' },
      { role: 'THERAPIST', display_name: 'Terapeuta' },
      { role: 'ADMINISTRATOR', display_name: 'Administrador' },
   ];

   return (
      <div className="mb-10 grid gap-10">
         <h2 className="font-semibold">Condiciones de trabajo</h2>
         <section className="mx-20 grid grid-cols-2 gap-5">
            <ComboBox
               placeholder="Seleccionar rol"
               label="Rol en la clínica"
               selectedKey={values.role}
               onSelectionChange={val => {
                  val && changeValue('role', val.toString() as Role);
               }}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'role')?.message
               }
            >
               {roles.map(role => (
                  <Item key={role.role} textValue={role.display_name}>
                     <div className="px-4 py-3 hover:bg-primary-100">
                        {role.display_name}
                     </div>
                  </Item>
               ))}
            </ComboBox>
            <ComboBox
               placeholder="Seleccionar sede"
               label="Sede"
               selectedKey={values.headquarter_id}
               onSelectionChange={val => {
                  val && changeValue('headquarter_id', val.toString());
               }}
               errorMessage={
                  errors?.find(error => error.path.at(0) === 'headquarter_id')
                     ?.message
               }
            >
               {headquarters
                  .sort((a, b) => a.index - b.index)
                  .filter(({ removed }) => !removed)
                  .map((quarter, i) => (
                     <Item key={quarter.id} textValue={quarter.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {quarter.name} -{' '}
                           {i > 0 ? `Sede ${i + 1}` : 'Sede principal'}
                        </div>
                     </Item>
                  ))}
            </ComboBox>
         </section>
         <div className="flex items-center justify-between">
            <h2 className="font-semibold">Añadir jornada laboral</h2>
            <Button
               className="flex !w-max !items-center gap-2"
               variant={Variant.secondary}
               onPress={() => setCreatingSchedule(true)}
            >
               <AddRounded /> Agregar horario
            </Button>
         </div>
         <section className="mx-20 grid grid-cols-2 gap-5">
            {schedules.length ? (
               schedules.map((schedule, i, { length }) => (
                  <div
                     key={i}
                     className={`${
                        length % 2 !== 0 && i === length - 1 && 'col-span-2'
                     }`}
                  >
                     <ScheduleCard
                        deleteAction={() =>
                           setSchedules(prev => {
                              const aux = [...prev];

                              aux.splice(i, 1);

                              return aux;
                           })
                        }
                        editAction={() => {
                           setEditingSchedule(i);
                        }}
                        schedule={schedule}
                     />
                  </div>
               ))
            ) : (
               <p className="col-span-2 my-10 w-full text-center font-semibold">
                  No has añadido ningún horario
               </p>
            )}
         </section>
         <div className="flex items-center justify-between">
            <h2
               className={`font-semibold ${
                  values.role !== 'THERAPIST' && 'opacity-50'
               }`}
            >
               Añadir servicios asociados
            </h2>
            <Button
               className="flex !w-max !items-center gap-2"
               variant={Variant.secondary}
               isDisabled={values.role !== 'THERAPIST'}
               onPress={() => setSelectingServices(true)}
            >
               <AddRounded /> Agregar servicios
            </Button>
         </div>
         <section className="mx-20 grid gap-5">
            {values.role === 'THERAPIST' && selectedServices.length ? (
               <>
                  {selectedServices.map((key, i) => {
                     const service = services.find(
                        ({ id }) => id.toString() === key.toString(),
                     );

                     return (
                        service && (
                           <ServiceOverviewCard
                              key={i}
                              service={service}
                              deleteButtonAction={() => setDeletingService(i)}
                           />
                        )
                     );
                  })}
               </>
            ) : (
               <p className="col-span-2 my-10 w-full text-center font-semibold">
                  No has agregado ningún servicio a este terapeuta
               </p>
            )}
         </section>
      </div>
   );
}
