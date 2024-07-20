'use client';

import { DeactivateUserInputType } from '@/app/api/deactivateUser/route';
import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { translateRole } from '@/lib/utils';
import { FullFilledUser, User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ServiceOverviewCard from '@/components/shared/cards/ServiceOverviewCard';
import { Key, useEffect, useState } from 'react';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import Dialog from '@/components/modal/Dialog';
import { ListBox } from '@/components/shared/ListBox';
import { Item } from 'react-stately';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScheduleCard from '@/components/shared/cards/ScheduleCard';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import {
   onlyLettersRegex,
   onlyNumbersRegex,
} from '@/lib/regex';
import TextField from '@/components/inputs/TextField';
import SelectServicesModal from '../../../components/SelectServicesModal';
import CreateScheduleModal from '../../../components/CreateScheduleModal';
import EditScheduleModal from '../../../components/EditScheduleModal';
import { Schedule } from '../../../create/views/CreationView';
import { Service } from '@/types/service';
import { AddRounded } from '@mui/icons-material';
import ModalTrigger from '@/components/modal/ModalTrigger';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import RemoveServiceModal from '../../../components/RemoveServiceModal';
import axios from 'axios';
import { editUser } from '@/services/user';
import { createSchedule, deleteSchedule } from '@/services/schedule';
import { createUserService, deleteUserService } from '@/services/user_service';
import RatingsCard from '@/components/shared/cards/RatingsCard';

interface IEditView {
   data: FullFilledUser;
   slug: string;
   services: Service[];
}

export default function EditView({ data, slug, services }: IEditView) {
   const router = useRouter();

   const [values, setValues] = useState({ ...data.user });

   const [selectedServices, setSelectedServices] = useState(
      data.services.map(({ service }) => service.id.toString() as Key),
   );
   const [selectingServices, setSelectingServices] = useState(false);
   const [deletingService, setDeletingService] = useState<number>();

   const [schedules, setSchedules] = useState<(Schedule & { id?: number })[]>(
      data.schedules.map(schedule => ({
         id: schedule.id,
         hours: schedule.hour_ranges,
         work_days: schedule.days.map(({ day }) => day.toString()),
      })),
   );
   const [creatingSchedule, setCreatingSchedule] = useState(false);
   const [editingSchedule, setEditingSchedule] = useState<number>();

   const [isLoading, setIsLoading] = useState(false);

   const [errors, setErrors] = useState<ZodError['errors']>();
   const [editionError, setEditionError] = useState<string>();

   const [closingOpen, setClosingOpen] = useState(false);
   const [editedOpen, setEditedOpen] = useState(false);

   const valuesSchema = z.object({
      names: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'El nombre solo puede contener letras y espacios.',
         ),

      last_names: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(70, maxLengthError(70))
         .regex(
            onlyLettersRegex,
            'Los apellidos solo puede contener letras y espacios.',
         ),
      address: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(200, maxLengthError(200)),

      email: z
         .string()
         .nonempty(nonEmptyMessage)
         .email('El email debe tener un formato correcto.'),

      phone: z
         .string()
         .nonempty(nonEmptyMessage)
         .max(20, maxLengthError(20))
         .regex(
            onlyNumbersRegex,
            'El teléfono solo puede contener números y espacios.',
         ),
   });

   async function edit() {
      setErrors(undefined);
      setEditionError(undefined);

      const valuesParsing = valuesSchema.safeParse(values);

      try {
         if (valuesParsing.success) {
            setIsLoading(true);

            await Promise.all([
               editUser(values, slug),
               ...schedules
                  .filter(schedule => schedule.id === undefined)
                  .map(schedule =>
                     createSchedule(
                        {
                           user_id: values.id,
                           days: schedule.work_days.map(day => Number(day)),
                           hour_ranges: schedule.hours.map(range => ({
                              start_hour: Number(range.start_hour),
                              end_hour: Number(range.end_hour),
                           })),
                        },
                        slug,
                     ),
                  ),

               ...data.schedules
                  .filter(
                     schedule =>
                        !schedules.some(
                           $schedule => $schedule.id === schedule.id,
                        ),
                  )
                  .map(schedule => deleteSchedule(schedule.id!, slug)),

               ...data.services
                  .filter(
                     ({ user_service }) =>
                        !selectedServices.some(
                           service => service === user_service.service_id,
                        ),
                  )
                  .map(({ user_service }) =>
                     deleteUserService(user_service.id, slug),
                  ),

               ...selectedServices
                  .filter(
                     service =>
                        !data.services.some(
                           ({ user_service }) =>
                              user_service.service_id === service,
                        ),
                  )
                  .map(service =>
                     createUserService(
                        {
                           service_id: Number(service),
                           user_id: values.id,
                        },
                        slug,
                     ),
                  ),
            ]);

            router.refresh();

            setEditedOpen(true);
         } else {
            setErrors(valuesParsing.error.errors);
         }
      } catch (error) {
         setEditionError('Ocurrió un error inesperado.');
      }

      setIsLoading(false);
   }

   function deleteService() {
      if (deletingService === undefined) return;

      setSelectedServices(prev => {
         const aux = [...prev];
         aux.splice(deletingService, 1);

         return aux;
      });
   }

   return (
      <>
         <CancelConfirmationModal
            isOpen={closingOpen}
            setIsOpen={setClosingOpen}
            route={clinicRoutes(slug).admin_team_id(values.id).details}
         />
         <SuccessModal
            email={values.email}
            isOpen={editedOpen}
            id={values.id}
            slug={slug}
         />
         <SelectServicesModal
            isOpen={selectingServices}
            services={services.filter(
               service => service.active && !service.removed,
            )}
            baseSelectedServices={selectedServices}
            setBaseSelectedServices={setSelectedServices}
            setIsOpen={setSelectingServices}
         />
         <CreateScheduleModal
            isOpen={creatingSchedule}
            setSchedules={setSchedules}
            setIsOpen={setCreatingSchedule}
         />
         {editingSchedule !== undefined && (
            <EditScheduleModal
               initialValues={schedules[editingSchedule]}
               isOpen
               setIsOpen={isOpen => !isOpen && setEditingSchedule(undefined)}
               setSchedules={setSchedules}
               index={editingSchedule}
            />
         )}
         <RemoveServiceModal
            action={() => {
               deleteService();
               setDeletingService(undefined);
            }}
            dismiss={() => {
               setDeletingService(undefined);
            }}
            isOpen={deletingService !== undefined}
         />
         <div className="my-12 grid grid-cols-[1fr_3fr] gap-14">
            <div className="mx-10 flex flex-col items-center">
               <div className="relative mb-10 aspect-square w-full">
                  <Image
                     src={
                        values.profile_picture.length
                           ? values.profile_picture
                           : '/default_profile_picture.svg'
                     }
                     className="rounded-full object-cover object-center"
                     alt="user image"
                     fill
                  />
               </div>
               <TextField
                  className="mb-2"
                  value={values.names}
                  placeholder="Nombres"
                  errorMessage={
                     errors?.find(error => error.path[0] === 'names')?.message
                  }
                  isDisabled={isLoading}
                  onChange={names => {
                     if (onlyLettersRegex.test(names) || names === '') {
                        setValues(prev => ({ ...prev, names }));
                     }
                  }}
               />
               <TextField
                  className="mb-2"
                  value={values.last_names}
                  placeholder="Apellidos"
                  errorMessage={
                     errors?.find(error => error.path[0] === 'last_names')
                        ?.message
                  }
                  isDisabled={isLoading}
                  onChange={last_names => {
                     if (
                        onlyLettersRegex.test(last_names) ||
                        last_names === ''
                     ) {
                        setValues(prev => ({ ...prev, last_names }));
                     }
                  }}
               />
               <h3 className="my-3 text-base text-on-background-text">
                  {translateRole(values.role)}
               </h3>
               <PopoverTrigger
                  trigger={
                     <div
                        className={`flex w-max justify-end gap-2 rounded-md !bg-foundation p-3 font-normal !text-black ${
                           !values.enabled && '!text-on-background-disabled'
                        }`}
                     >
                        {values.enabled ? (
                           <>
                              <CircleRoundedIcon className="!fill-success" />
                              Activo
                           </>
                        ) : (
                           <>
                              <CircleOutlinedRoundedIcon />
                              Inactivo
                           </>
                        )}
                        <ArrowDropDownRoundedIcon className="!fill-on-background-text" />
                     </div>
                  }
               >
                  <Dialog className="rounded">
                     <ListBox className="right-0 !p-0 shadow-xl">
                        {values.enabled ? (
                           <Item textValue="Desactivar">
                              <button
                                 onClick={() =>
                                    setValues(prev => ({
                                       ...prev,
                                       enabled: false,
                                    }))
                                 }
                                 className="w-full p-3 text-start"
                              >
                                 Desactivar
                              </button>
                           </Item>
                        ) : (
                           <Item textValue="Activar">
                              <button
                                 onClick={() =>
                                    setValues(prev => ({
                                       ...prev,
                                       enabled: true,
                                    }))
                                 }
                                 className="w-full p-3 text-start"
                              >
                                 Activar
                              </button>
                           </Item>
                        )}
                     </ListBox>
                  </Dialog>
               </PopoverTrigger>
            </div>
            <div className="grid h-max gap-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl">Información general</h3>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <Button
                        className="h-min w-max !px-12"
                        variant={Variant.secondary}
                        isDisabled={isLoading}
                        onPress={() => setClosingOpen(true)}
                     >
                        Cancelar
                     </Button>
                     <Button
                        isDisabled={isLoading}
                        onPress={() => {
                           const administratorParsing =
                              valuesSchema.safeParse(values);

                           !administratorParsing.success
                              ? setErrors(administratorParsing.error.errors)
                              : edit();
                        }}
                        className="h-min w-max !px-12"
                     >
                        {isLoading ? (
                           <>
                              Cargando...
                              <RefreshRoundedIcon className="animate-spin" />
                           </>
                        ) : (
                           'Guardar'
                        )}
                     </Button>
                     {editionError && (
                        <div className="w-full flex-none text-end text-error">
                           {editionError}
                        </div>
                     )}
                  </div>
               </div>
               <section className="grid grid-cols-2 gap-5">
                  <TextField
                     value={values.email}
                     isDisabled
                     label="Correo electrónico"
                  />
                  <TextField
                     value={values.phone}
                     placeholder="Ingresar número"
                     label="Teléfono"
                     errorMessage={
                        errors?.find(error => error.path[0] === 'phone')
                           ?.message
                     }
                     isDisabled={isLoading}
                     onChange={phone => {
                        if (onlyNumbersRegex.test(phone) || phone === '') {
                           setValues(prev => ({ ...prev, phone }));
                        }
                     }}
                  />
                  <div className="col-span-2">
                     <TextField
                        value={values.address}
                        placeholder="Dirección"
                        label="Ingresar dirección"
                        errorMessage={
                           errors?.find(error => error.path[0] === 'address')
                              ?.message
                        }
                        isDisabled={isLoading}
                        onChange={address => {
                           setValues(prev => ({ ...prev, address }));
                        }}
                     />
                  </div>
                  <div className="col-span-2">
                     <div className="mb-5 flex items-center justify-between">
                        <p className="font-semibold text-on-background-text label">
                           Jornada laboral
                        </p>
                        <Button
                           className="flex !w-max !items-center gap-2"
                           variant={Variant.outlined}
                           onPress={() => setCreatingSchedule(true)}
                        >
                           <AddRounded /> Agregar horario
                        </Button>
                     </div>
                     <div className="grid grid-cols-2 gap-5">
                        {schedules.map((schedule, i, { length }) => (
                           <div
                              key={i}
                              className={`${
                                 length % 2 !== 0 &&
                                 i === length - 1 &&
                                 'col-span-2'
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
                        ))}
                     </div>
                  </div>
               </section>
               <div className="flex items-center justify-between">
                  <h3 className="text-xl">Servicios asociados</h3>
                  <Button
                     className="flex !w-max !items-center gap-2"
                     variant={Variant.outlined}
                     isDisabled={values.role !== 'THERAPIST'}
                     onPress={() => setSelectingServices(true)}
                  >
                     <div className="flex items-center justify-between"></div>
                     <AddRounded /> Agregar servicios
                  </Button>
               </div>
               <section className="grid gap-5">
                  {selectedServices.map((key, i) => {
                     const service = services.find(
                        ({ id }) => id.toString() === key.toString(),
                     );

                     return (
                        service?.active && (
                           <ServiceOverviewCard
                              key={i}
                              service={service}
                              deleteButtonAction={() => setDeletingService(i)}
                           />
                        )
                     );
                  })}
               </section>
               <h3 className="text-xl">Calificaciones</h3>
               <section className="opacity-50">
                  <RatingsCard {...data.rating} />
               </section>
            </div>
         </div>
      </>
   );
}

function SuccessModal({
   slug,
   isOpen,
   id,
   email,
}: {
   slug: string;
   isOpen: boolean;
   id?: number;
   email: string | undefined;
}) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Tus cambios se han guardado
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     Podrás ver tus cambios actualizados en el detalle de cada
                     usuario
                  </p>
               </div>
               <Button
                  onPress={() => {
                     if (!id) return;
                     router.push(clinicRoutes(slug).admin_team_id(id).details);
                     router.refresh();
                  }}
                  className="!w-max !px-24"
               >
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
