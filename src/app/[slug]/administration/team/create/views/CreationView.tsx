'use client';

import { Key, useEffect, useState } from 'react';
import CreationState from '@/components/shared/CreationState';
import Button from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { Service } from '@/types/service';
import { ZodError, z } from 'zod';
import { maxLengthError, nonEmptyMessage } from '@/lib/validations';
import { onlyNumbersRegex, onlyLettersRegex } from '@/lib/regex';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { changeTitle } from '@/lib/features/title/title_slice';
import { PersonalCreationState } from '../utils';
import { NewUser, Role } from '@/types/user';
import PersonalDataForm from '../../views/PersonalDataForm';
import WorkConditionsForm from '../../views/WorkConditionsForm';
import { Headquarter } from '@/types/headquarter';
import CreateScheduleModal from '../../components/CreateScheduleModal';
import EditScheduleModal from '../../components/EditScheduleModal';
import SelectServicesModal from '../../components/SelectServicesModal';
import { createUserFullFilled } from '@/services/user';
import { AxiosError } from 'axios';
import RemoveServiceModal from '../../components/RemoveServiceModal';

export type NewUserWithStrings = Omit<
   NewUser,
   'identification_type' | 'headquarter_id'
> & {
   identification_type: string;
   headquarter_id: string;
};

const serviceInitialState: NewUserWithStrings = {
   enabled: true,
   names: '',
   last_names: '',
   phone: '',
   address: '',
   email: '',
   profile_picture: '',
   cognito_id: '',
   role: '' as Role,
   identification: '',
   identification_type: '',
   headquarter_id: '',
   date_created: new Date(),
};

export type Schedule = {
   work_days: string[];
   hours: {
      start_hour: string;
      end_hour: string;
   }[];
};

interface ICreationView {
   slug: string;
   headquarters: Headquarter[];
   services: Service[];
}

export default function CreationView({
   slug,
   headquarters,
   services,
}: ICreationView) {
   const router = useRouter();

   const dispatch = useAppDispatch();

   const [state, setState] = useState(PersonalCreationState.personal_data);
   const [creating, setCreating] = useState(false);
   const [creationError, setCreationError] = useState<string>();

   const [userId, setUserId] = useState<number>();

   const [schedules, setSchedules] = useState<Schedule[]>([]);
   const [creatingSchedule, setCreatingSchedule] = useState(false);
   const [editingSchedule, setEditingSchedule] = useState<number>();

   const [selectedServices, setSelectedServices] = useState<Key[]>([]);
   const [selectingServices, setSelectingServices] = useState(false);
   const [deletingService, setDeletingService] = useState<number>();

   const [values, setValues] = useState(serviceInitialState);

   async function create() {
      if (creating) return;

      setCreating(true);

      try {
         const {
            data: { id },
         } = await createUserFullFilled(
            {
               schedules: schedules.map(schedule => ({
                  days: schedule.work_days.map(day => Number(day)),
                  hour_ranges: schedule.hours.map(range => ({
                     start_hour: Number(range.start_hour),
                     end_hour: Number(range.end_hour),
                  })),
               })),
               user: {
                  ...values,
                  headquarter_id: Number(values.headquarter_id),
                  identification_type: Number(values.identification_type),
               },
               services: selectedServices.map(service => Number(service)),
            },
            slug,
         );

         setUserId(id);
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setCreationError('El correo ingresado no está disponible.');
         } else {
            setCreationError('Ocurrió un error inesperado.');
         }
      }

      setCreating(false);
   }

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
         .max(100, maxLengthError(100)),

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
      identification: z.string().nonempty(nonEmptyMessage),
      identification_type: z.string().nonempty(nonEmptyMessage),
   });

   const workConditionsSchema = z.object({
      role: z.string().nonempty(nonEmptyMessage),
      headquarter_id: z.string().nonempty(nonEmptyMessage),
   });

   const [errors, setErrors] = useState<ZodError['errors']>();

   const steps = [
      { name: 'Datos personales', state: PersonalCreationState.personal_data },
      {
         name: 'Condiciones de trabajo',
         state: PersonalCreationState.conditions,
      },
   ];

   function deleteService() {
      if (deletingService === undefined) return;

      setSelectedServices(prev => {
         const aux = [...prev];
         aux.splice(deletingService, 1);

         return aux;
      });
   }

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(slug).admin_team,
            value: 'Equipo / Crear usuario',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setErrors(undefined);
   }, [state]);

   useEffect(() => {
      setSelectedServices([]);
   }, [values.role]);

   return (
      <>
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
         <SuccessModal
            email={values.email}
            isOpen={userId !== undefined}
            id={userId}
            slug={slug}
         />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto]">
            <CreationState
               className="w-1/3 grid-cols-[auto_1fr_auto]"
               steps={steps}
               state={state}
            />
            {state === PersonalCreationState.personal_data ? (
               <PersonalDataForm
                  errors={errors}
                  values={values}
                  setValues={setValues}
               />
            ) : (
               <WorkConditionsForm
                  errors={errors}
                  values={values}
                  setValues={setValues}
                  headquarters={headquarters}
                  setCreatingSchedule={setCreatingSchedule}
                  schedules={schedules}
                  setSchedules={setSchedules}
                  setEditingSchedule={setEditingSchedule}
                  setSelectingServices={setSelectingServices}
                  services={services}
                  selectedServices={selectedServices}
                  setSelectedServices={setSelectedServices}
                  setDeletingService={setDeletingService}
               />
            )}
            <div />
            <div className="my-5 flex flex-wrap justify-between gap-y-4">
               {creationError && (
                  <div className="w-full flex-none text-end text-error">
                     {creationError}
                  </div>
               )}
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     if (creating) return;
                     switch (state) {
                        case PersonalCreationState.personal_data:
                           router.push(clinicRoutes(slug).admin_team);
                           break;
                        default:
                           setState(PersonalCreationState.personal_data);
                           break;
                     }
                  }}
                  className="flex w-max items-center gap-2 bg-transparent !text-black"
               >
                  <ArrowBackRoundedIcon />
                  {state === PersonalCreationState.personal_data
                     ? 'Regresar a Equipo'
                     : 'Anterior'}
               </Button>
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     setErrors(undefined);
                     if (creating) return;

                     if (state === PersonalCreationState.personal_data) {
                        const valuesParsing = valuesSchema.safeParse(values);

                        valuesParsing.success
                           ? setState(PersonalCreationState.conditions)
                           : setErrors(valuesParsing.error.errors);
                     } else {
                        const valuesParsing =
                           workConditionsSchema.safeParse(values);

                        valuesParsing.success
                           ? create()
                           : setErrors(valuesParsing.error.errors);
                     }
                  }}
                  className="flex w-max items-center gap-2 !px-20"
               >
                  {creating ? (
                     <>
                        Cargando...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : state === PersonalCreationState.personal_data ? (
                     <>
                        Continuar
                        <ArrowForwardRoundedIcon />
                     </>
                  ) : (
                     'Agregar nuevo usuario'
                  )}
               </Button>
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
                     ¡Has creado un nuevo usuario!
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     Hemos enviado una invitación al correo {email} para <br />
                     terminar de activar la cuenta de usuario
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
