'use client';

import SubmittedFormsTable from '@/components/shared/tables/SubmittedFormsTable';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { Appointment } from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import {
   Dispatch,
   Key,
   SetStateAction,
   useEffect,
   useMemo,
   useState,
} from 'react';
import { Item, SortDirection } from 'react-stately';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import { clinicRoutes } from '@/lib/routes';
import AppointmentStateChip from '@/components/shared/AppointmentStateChip';
import { changeTitle } from '@/lib/features/title/title_slice';
import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { formatPrice, translateAppointmentAssistance } from '@/lib/utils';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Select } from '@/components/inputs/Select';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { editAppointment } from '@/services/appointment';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface IDetailsView {
   appointment: Appointment;
   patient: User;
   therapist: User;
   submittedForms: SubmittedFile[];
   forms: IFile[];
   service: Service;
   headquarter: Headquarter;
}

export default function DetailsView({
   appointment,
   forms,
   patient,
   service,
   submittedForms,
   therapist,
   headquarter,
}: IDetailsView) {
   const router = useRouter();

   const dispatch = useAppDispatch();

   const { hours } = useAppSelector(store => store.catalogues);

   const clinic = useAppSelector(store => store.clinic);

   const clinicCurrency = useClinicCurrency();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();
   const [sortedForms, setSortedForms] = useState(forms);

   const [changingState, setChangingState] = useState(false);

   const [isClosing, setIsClosing] = useState(false);
   const [isMissed, setIsMissed] = useState(false);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...forms];

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (column) {
            case 'public_name':
               return first.public_name.localeCompare(sec.public_name);
            case 'state':
               return (
                  Number(
                     submittedForms.some(form => form.form_id === first.id),
                  ) -
                  Number(submittedForms.some(form => form.form_id === sec.id))
               );

            default:
               return data2.id - data1.id;
         }
      });

      setSortedForms(aux);
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, forms]);

   const code = usePhoneCode();

   const isClosed = useMemo(
      () => ['CANCELED', 'CLOSED'].some(state => appointment.state === state),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [appointment.state, appointment.assistance],
   );

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: isClosed
               ? clinicRoutes(clinic.slug).receptionist_appointments_history
               : clinicRoutes(clinic.slug).receptionist_appointments_actives,
            value: isClosed
               ? 'Reservas / Historial de reservas / Detalles de reserva'
               : 'Reservas / Reservas activas / Detalles de reserva',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, appointment.state, appointment.assistance]);

   return (
      <>
         <ClosedModal isOpen={isMissed} setIsOpen={setIsMissed} />
         <InAssistanceModal
            action={async () => {
               setChangingState(true);

               try {
                  await editAppointment(clinic.slug, {
                     ...appointment,
                     assistance: 'MISSED',
                     state: 'CLOSED',
                  });

                  setIsClosing(false);
                  setIsMissed(true);
               } catch (error) {}

               setChangingState(false);
            }}
            isClosing={changingState}
            isOpen={isClosing}
            setIsOpen={setIsClosing}
         />
         <div className="grid h-max gap-10">
            <div className="flex items-center justify-between">
               <h3 className="text-xl">Información de la reserva</h3>
               {!isClosed && (
                  <div className="flex items-center gap-4">
                     <Button
                        href={
                           clinicRoutes(
                              clinic.slug,
                           ).receptionist_appointments_id(appointment.id).edit
                        }
                        className="flex items-center gap-2 !px-6 !py-2"
                        variant={Variant.secondary}
                     >
                        <EditRoundedIcon /> Editar
                     </Button>
                     {!!appointment.assistance ? (
                        <Button
                           className={`flex w-max items-center gap-2 whitespace-nowrap !px-6 !py-2 ${
                              appointment.assistance === 'ATTENDED'
                                 ? '!bg-success'
                                 : '!bg-error'
                           }`}
                        >
                           <FlagRoundedIcon />{' '}
                           {appointment.assistance === 'ATTENDED'
                              ? 'El paciente asistió'
                              : 'El paciente no asistió'}
                        </Button>
                     ) : (
                        <Select
                           isDisabled={changingState}
                           staticWidth
                           className="flex items-center gap-2 border border-secondary bg-transparent !px-10 !py-2 !text-secondary"
                           onSelectionChange={async val => {
                              if (val === 'ATTENDED') {
                                 setChangingState(true);

                                 try {
                                    await editAppointment(clinic.slug, {
                                       ...appointment,
                                       assistance: 'ATTENDED',
                                    });

                                    router.refresh();
                                 } catch (error) {}

                                 setChangingState(false);
                              } else {
                                 setIsClosing(true);
                              }
                           }}
                           triggerContent={
                              <>
                                 {changingState ? (
                                    <>
                                       Cargando...
                                       <RefreshRoundedIcon className="animate-spin" />
                                    </>
                                 ) : (
                                    <>
                                       <FlagOutlinedIcon /> Asistencia
                                    </>
                                 )}
                              </>
                           }
                        >
                           <Item key="ATTENDED">
                              <div className="w-full truncate py-3 pl-8">
                                 Paciente asistió
                              </div>
                           </Item>
                           <Item key="MISSED">
                              <div className="w-full truncate py-3 pl-8">
                                 Marcar inasistencia
                              </div>
                           </Item>
                        </Select>
                     )}
                  </div>
               )}
            </div>
            <section className="mx-24 grid grid-cols-2 gap-5">
               <div>
                  <p className="mb-2 font-semibold">Servicio</p>
                  <p className="text-on-background-text">{service.name}</p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Estado de la atención</p>
                  <div className="w-max text-on-background-text">
                     <AppointmentStateChip state={appointment.state} />
                  </div>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Fecha</p>
                  <p className="text-on-background-text">
                     {(date =>
                        `${Intl.DateTimeFormat(undefined, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`)(
                        new Date(appointment.date),
                     )}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Hora</p>
                  <p className="text-on-background-text">
                     {
                        hours.find(
                           ({ code }) => appointment.hour.toString() === code,
                        )?.name
                     }
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Precio</p>
                  <p className="text-on-background-text">
                     {formatPrice(Number(appointment.price), clinicCurrency)}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Lugar del servicio</p>
                  <p className="text-on-background-text">
                     {headquarter.name} -{' '}
                     {headquarter.index > 0
                        ? `Sede ${headquarter.index + 1}`
                        : 'Sede principal'}
                  </p>
               </div>
               {!!appointment.assistance && isClosed && (
                  <div>
                     <p className="mb-2 font-semibold">
                        Asistencia del paciente
                     </p>
                     <p className="text-on-background-text">
                        {translateAppointmentAssistance(appointment.assistance)}
                     </p>
                  </div>
               )}
            </section>
            <h3 className="text-xl">Información del paciente</h3>
            <section className="mx-24">
               <UserOverviewCard
                  code={code}
                  url={
                     clinicRoutes(clinic.slug).receptionist_patients_id(
                        patient.id,
                     ).details
                  }
                  user={patient}
               />
            </section>
            <h3 className="text-xl">Información del terapeuta</h3>
            <section className="mx-24">
               <UserOverviewCard code={code} user={therapist} />
            </section>
            <h3 className="text-xl">Documentos adjuntos</h3>
            <section className="mx-24 grid gap-5">
               <SubmittedFormsTable
                  columnState={columnState}
                  directionState={directionState}
                  forms={sortedForms}
                  submittedForms={submittedForms}
               />
            </section>
            {isClosed && (
               <section className="flex justify-between">
                  <h3 className="text-xl">Historia clínica</h3>
                  <Button
                     className="flex !w-max items-center gap-2 !px-9"
                     href={
                        clinicRoutes(clinic.slug).receptionist_appointments_id(
                           appointment.id,
                        ).history
                     }
                     variant={Variant.secondary}
                  >
                     Abrir historia clínica <ArrowForwardRoundedIcon />
                  </Button>
               </section>
            )}
         </div>
      </>
   );
}

interface IInAssistanceModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   action: () => any;
   isClosing: boolean;
}

function InAssistanceModal({
   isOpen,
   setIsOpen,
   action,
   isClosing,
}: IInAssistanceModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-12">
               <WarningRoundedIcon className="!text-8xl !text-warning" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     ¿Deseas marcar inasistencia y finalizar esta reserva?
                  </h3>
                  <p className="text-center !font-normal text-on-background-text body-1">
                     Si marcas la inasistencia del paciente, se finalizará{' '}
                     <br />
                     la reserva de forma automática. El estado no se podrá
                     cambiar
                  </p>
               </div>
               <div className="grid w-full grid-cols-2 gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     Atrás
                  </Button>
                  <Button isDisabled={isClosing} onPress={action}>
                     {isClosing ? (
                        <>
                           Cargando...
                           <RefreshRoundedIcon className="animate-spin" />
                        </>
                     ) : (
                        <>Marcar inasistencia y finalizar</>
                     )}
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}

interface IClosedModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
}

function ClosedModal({ isOpen, setIsOpen }: IClosedModal) {
   const router = useRouter();

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Finalizaste la reserva
                  </h3>
                  <p className="text-center !font-normal text-on-background-text body-1">
                     Ahora podrás ver los datos de la reserva en el historial de
                     reservas
                  </p>
               </div>
               <div className="grid w-full grid-cols-2 gap-5">
                  <Button
                     variant={Variant.secondary}
                     href={clinicRoutes(slug).receptionist_appointments_actives}
                  >
                     Volver a reservas activas
                  </Button>
                  <Button
                     onPress={() => {
                        router.refresh();
                        setIsOpen(false);
                     }}
                  >
                     Ver detalles en el historial
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
