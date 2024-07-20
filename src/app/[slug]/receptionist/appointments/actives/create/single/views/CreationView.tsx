'use client';

import CreationState from '@/components/shared/CreationState';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { nonEmptyMessage, nonUnselectedMessage } from '@/lib/validations';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import {
   NewUser,
   TherapistWithSchedule,
   User,
   UserService,
} from '@/types/user';
import { useEffect, useState } from 'react';
import { ZodError, z } from 'zod';
import FormView from './FormView';
import PreviewView from './PreviewView';
import Button from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { today } from '@internationalized/date';
import { timezone } from '@/lib/utils';
import { DateValue } from 'react-aria';
import {
   Appointment,
   AppointmentState,
   PaymentMethod,
} from '@/types/appointment';
import { AxiosError } from 'axios';
import {
   createAppointment,
   createAppointmentWithPatient,
} from '@/services/appointment';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningModal from '../../../components/WarningModal';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { convertCurrencyToUSD } from '@/services/currency';
import { createInvoice } from '@/services/invoice';

interface ICreationVIew {
   services: Service[];
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   patients: User[];
   userServices: UserService[];
   appointments: Appointment[];
}

enum AppointmentCreationState {
   creation,
   review,
}

export type NewAppointmentWithDate = typeof initialState;

const initialState = {
   headquarter_id: '',
   service_id: '',
   price: '',
   state: 'TO_PAY' as AppointmentState,
   date: today(timezone) as DateValue,
   hour: '',
   patient_id: '',
   therapist_id: '',
   payment_method: 'ONLINE' as PaymentMethod,
};

export default function CreationView({
   headquarters,
   services,
   therapists,
   patients,
   userServices,
   appointments,
}: ICreationVIew) {
   const router = useRouter();

   const [state, setState] = useState(AppointmentCreationState.creation);
   const [creating, setCreating] = useState(false);
   const [creationError, setCreationError] = useState<string>();

   const [appointmentId, setAppointmentId] = useState<number>();

   const [values, setValues] = useState(initialState);

   const [errors, setErrors] = useState<ZodError['errors']>();

   const [newPatient, setNewPatient] = useState<NewUser>();

   const [randomTherapist, setRandomTherapist] = useState<string>();

   const { slug } = useAppSelector(store => store.clinic);

   const [closing, setClosing] = useState(false);

   const [invoice, setInvoice] = useState<{ id: string; url: string }>();

   const valuesSchema = z.object({
      headquarter_id: z.string().nonempty(nonUnselectedMessage),
      service_id: z.string().nonempty(nonUnselectedMessage),
      price: z.string().nonempty(nonEmptyMessage),
      state: z.string().nonempty(nonEmptyMessage),
      date: z.unknown({ required_error: nonEmptyMessage }),
      hour: z.string().nonempty(nonUnselectedMessage),
      patient_id: !!newPatient
         ? z.any().optional()
         : z.string().nonempty(nonUnselectedMessage),
      therapist_id: z.string().nonempty(nonUnselectedMessage),
      payment_method: z.string().nonempty(nonUnselectedMessage),
   });

   const steps = [
      { name: 'Datos generales', state: AppointmentCreationState.creation },
      {
         name: 'Resumen',
         state: AppointmentCreationState.review,
      },
   ];

   useEffect(() => {
      setErrors(undefined);
   }, [state]);

   async function create() {
      if (creating) return;

      setCreating(true);
      setCreationError(undefined);

      try {
         if (newPatient) {
            const { id } = await createAppointmentWithPatient(slug, {
               appointment: {
                  date: values.date.toDate(timezone).toString(),
                  headquarter_id: Number(values.headquarter_id),
                  hour: Number(values.hour),
                  patient_id: -1,
                  payment_method: values.payment_method,
                  service_id: Number(values.service_id),
                  therapist_id:
                     values.therapist_id === '-1' && randomTherapist
                        ? Number(randomTherapist)
                        : Number(values.therapist_id),
                  price: values.price,
                  state: values.state,
                  invoice_id:
                     values.payment_method === 'ONLINE'
                        ? invoice?.id ?? ''
                        : '',
                  creation_date: new Date().toString(),
               },
               user: newPatient,
            });

            setAppointmentId(id);
         } else {
            const { id } = await createAppointment(slug, {
               date: values.date.toDate(timezone).toString(),
               headquarter_id: Number(values.headquarter_id),
               hour: Number(values.hour),
               patient_id: Number(values.patient_id),
               payment_method: values.payment_method,
               service_id: Number(values.service_id),
               therapist_id:
                  values.therapist_id === '-1' && randomTherapist
                     ? Number(randomTherapist)
                     : Number(values.therapist_id),
               price: values.price,
               state: values.state,
               invoice_id:
                  values.payment_method === 'ONLINE' ? invoice?.id ?? '' : '',
               creation_date: new Date().toString(),
            });

            setAppointmentId(id);
         }
      } catch (error) {
         if ((error as AxiosError).response?.status === 409) {
            setCreationError('El correo ingresado no está disponible.');
         } else {
            setCreationError('Ocurrió un error inesperado.');
         }
      }

      setCreating(false);
   }

   const currency = useClinicCurrency();

   useEffect(() => {
      if (!values.service_id) return;

      const service = services.find(
         service => service.id?.toString() === values.service_id,
      );

      if (service && currency && values.payment_method === 'ONLINE') {
         setInvoice(undefined);

         (async () => {
            const {
               data: {
                  rates: {
                     USD: { rate_for_amount },
                  },
               },
            } = await convertCurrencyToUSD(currency, Number(service.price));

            const aux = rate_for_amount.split('.');

            const { data } = await createInvoice(slug, {
               price: Number(`${aux[0]}.${aux[1].slice(0, 2) ?? 0}`),
               services_name: service.name,
               services_quantity: 1,
            });

            setInvoice(data);
         })();
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values.service_id, values.payment_method]);

   return (
      <>
         <WarningModal
            cancel={() =>
               router.push(clinicRoutes(slug).receptionist_appointments_actives)
            }
            isOpen={closing}
            setIsOpen={setClosing}
         />
         <SuccessModal
            isOpen={appointmentId !== undefined}
            id={appointmentId}
            slug={slug}
         />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto]">
            <CreationState
               className="w-1/3 grid-cols-[auto_1fr_auto]"
               steps={steps}
               state={state}
            />
            {state === AppointmentCreationState.creation ? (
               <FormView
                  errors={errors}
                  setValues={setValues}
                  values={values}
                  headquarters={headquarters}
                  services={services}
                  therapists={therapists}
                  patients={patients}
                  userServices={userServices}
                  appointments={appointments}
                  newPatient={newPatient}
                  setNewPatient={setNewPatient}
                  setRandomTherapist={setRandomTherapist}
               />
            ) : (
               <PreviewView
                  therapists={therapists}
                  randomTherapist={randomTherapist}
                  values={values}
                  headquarters={headquarters}
                  patients={patients}
                  newPatient={newPatient}
                  services={services}
                  invoice={invoice}
                  setInvoice={setInvoice}
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
                        case AppointmentCreationState.creation:
                           setClosing(true);
                           break;
                        default:
                           setState(AppointmentCreationState.creation);
                           break;
                     }
                  }}
                  className="flex w-max items-center gap-2 bg-transparent !text-black"
               >
                  <ArrowBackRoundedIcon />
                  {state === AppointmentCreationState.creation
                     ? 'Regresar a reservas activas'
                     : 'Anterior'}
               </Button>
               <Button
                  isDisabled={creating}
                  onPress={() => {
                     setErrors(undefined);
                     if (creating) return;

                     if (state === AppointmentCreationState.creation) {
                        const valuesParsing = valuesSchema.safeParse(values);

                        valuesParsing.success
                           ? setState(AppointmentCreationState.review)
                           : setErrors(valuesParsing.error.errors);
                     } else {
                        create();
                     }
                  }}
                  className="flex w-max items-center gap-2 !px-20"
               >
                  {creating ? (
                     <>
                        Cargando...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : state === AppointmentCreationState.creation ? (
                     <>
                        Continuar
                        <ArrowForwardRoundedIcon />
                     </>
                  ) : (
                     'Crear reserva'
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
}: {
   slug: string;
   isOpen: boolean;
   id?: number;
}) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Has creado una nueva reserva
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     Tu reserva estará visible en tu lista de reservas. Recuerda
                     que la reserva <br /> cambiará a confirmada una vez el
                     cliente haya hecho efectivo el pago.
                  </p>
               </div>
               <Button
                  onPress={() => {
                     if (!id) return;
                     router.push(
                        clinicRoutes(slug).receptionist_appointments_id(id)
                           .details,
                     );
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
