'use client';

import SubmittedFormsTable from '@/components/shared/tables/SubmittedFormsTable';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { Appointment } from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import { Dispatch, Key, SetStateAction, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import { clinicRoutes, ClinicRoute } from '@/lib/routes';
import AppointmentStateChip from '@/components/shared/AppointmentStateChip';
import { changeTitle } from '@/lib/features/title/title_slice';
import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { editAppointment } from '@/services/appointment';
import SuccessModal from '../../components/SuccessModal';
import ClosingConfirmationModal from '../../components/ClosingConfirmationModal';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { downloadURI, formatPrice } from '@/lib/utils';
import {
   AccessTimeRounded,
   AddRounded,
   CheckCircleRounded,
   DownloadRounded,
} from '@mui/icons-material';
import Card from '@/components/shared/cards/Card';
import FormCard from '@/components/shared/cards/FormCard';

interface IDetailsView {
   appointment: Appointment;
   patient: User;
   therapist: User;
   submittedForms: SubmittedFile[];
   forms: IFile[];
   service: Service;
   headquarter: Headquarter;
   clinicHistories: ClinicHistory[];
}

export default function DetailsView({
   appointment,
   forms,
   patient,
   service,
   submittedForms,
   headquarter,
   clinicHistories,
}: IDetailsView) {
   const router = useRouter();

   const { hours } = useAppSelector(store => store.catalogues);

   const clinic = useAppSelector(store => store.clinic);

   const clinicCurrency = useClinicCurrency();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();
   const [sortedForms, setSortedForms] = useState(forms);

   const [isClosing, setIsClosing] = useState(false);

   const [closingError, setClosingError] = useState(false);

   const [closingModalOpen, setClosingModalOpen] = useState(false);

   const [closedSuccessfully, setClosedSuccessfully] = useState(false);

   const [addNoteOpen, setAddNoteOpen] = useState(false);

   async function closeAppointment() {
      if (isClosing || isClosed) return;

      setIsClosing(true);
      setClosingError(false);

      try {
         await editAppointment(clinic.slug, {
            ...appointment,
            state: 'CLOSED',
         });

         setClosedSuccessfully(true);
      } catch (error) {
         setClosingError(true);
      }

      setClosingModalOpen(false);
      setIsClosing(false);
   }

   const dispatch = useAppDispatch();

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

   const isClosed = ['CANCELED', 'CLOSED'].some(
      state => appointment.state === state,
   );

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: isClosed
               ? clinicRoutes(clinic.slug).therapist_appointments_history
               : clinicRoutes(clinic.slug).therapist_appointments_actives,
            value: isClosed
               ? 'Reservas / Historial de reservas / Detalles de reserva'
               : 'Reservas / Reservas activas / Detalles de reserva',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, isClosed]);

   return (
      <>
         <ShouldAddNoteModal
            isOpen={addNoteOpen}
            setIsOpen={setAddNoteOpen}
            route={
               clinicRoutes(clinic.slug).therapist_appointments_id(
                  appointment.id,
               ).history
            }
         />
         <SuccessModal
            isOpen={closedSuccessfully}
            action={() => {
               setClosedSuccessfully(false);
               router.refresh();
            }}
         />
         <ClosingConfirmationModal
            close={closeAppointment}
            isClosing={isClosing}
            isOpen={closingModalOpen}
            setIsOpen={setClosingModalOpen}
         />
         <div className="grid h-max gap-5 md:gap-10">
            <div className="hidden items-center justify-between gap-5 md:flex">
               <h3 className="text-base lg:text-xl">
                  Información de la reserva
               </h3>
               {!isClosed && (
                  <div className="grid grid-cols-[auto_auto] gap-5 justify-self-end">
                     <Button
                        variant={Variant.secondary}
                        className="flex h-min w-full items-center gap-2 !px-12"
                        href={
                           clinicRoutes(clinic.slug).therapist_appointments_id(
                              appointment.id,
                           ).history
                        }
                     >
                        <AddRoundedIcon /> Agregar nota clínica
                     </Button>
                     <Button
                        isDisabled={!appointment.assistance}
                        className="!px-6"
                        onPress={() =>
                           !clinicHistories.length
                              ? setAddNoteOpen(true)
                              : setClosingModalOpen(true)
                        }
                     >
                        Finalizar servicio
                     </Button>
                     {closingError && (
                        <div className="col-span-2 w-full flex-none text-end text-error">
                           Ocurrió un error inesperado.
                        </div>
                     )}
                  </div>
               )}
            </div>
            <div className="flex items-center justify-between gap-5 border-b border-on-background-disabled pb-5 md:hidden">
               <h3 className="text-base lg:text-xl">Información general</h3>
               <Button
                  className="flex !w-max items-center gap-1"
                  href={
                     clinicRoutes(clinic.slug).therapist_appointments_id(
                        appointment.id,
                     ).history
                  }
                  variant={Variant.secondary}
               >
                  Nota clínica <AddRounded />
               </Button>
            </div>
            <section className="grid gap-5 sm:grid-cols-2 lg:mx-24">
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
                     {(date => {
                        return `${Intl.DateTimeFormat(undefined, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`;
                     })(new Date(appointment.date))}
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
            </section>
            <h3 className="border-t border-on-background-disabled pt-5 text-base md:border-t-0 md:pt-0 lg:text-xl">
               Información del paciente
            </h3>
            <section className="border-b border-on-background-disabled pb-5 md:border-b-0 md:pb-0 lg:mx-24">
               <UserOverviewCard
                  code={code}
                  user={patient}
                  url={
                     clinicRoutes(clinic.slug).therapist_patients_id(patient.id)
                        .details
                  }
               />
            </section>
            <h3 className="text-base lg:text-xl">Documentos adjuntos</h3>
            <section className="hidden lg:mx-24 lg:block">
               <SubmittedFormsTable
                  columnState={columnState}
                  directionState={directionState}
                  forms={sortedForms}
                  submittedForms={submittedForms}
               />
            </section>
            <section className="grid gap-5 md:grid-cols-2 lg:hidden">
               {forms.map(form => (
                  <FormCard
                     key={form.id}
                     submittedForm={submittedForms.find(
                        ({ form_id }) => form_id === form.id,
                     )}
                     form={form}
                  />
               ))}
            </section>
            <section className="hidden justify-between md:flex">
               <h3 className="text-base lg:text-xl">Historia clínica</h3>
               <Button
                  className="flex !w-max items-center gap-2 !px-9"
                  href={
                     clinicRoutes(clinic.slug).therapist_appointments_id(
                        appointment.id,
                     ).history
                  }
                  variant={Variant.secondary}
               >
                  Abrir historia clínica <ArrowForwardRoundedIcon />
               </Button>
            </section>
            {!isClosed && (
               <div className="mt-5 grid gap-5 md:hidden">
                  <Button
                     isDisabled={!appointment.assistance}
                     className="!px-6"
                     onPress={() =>
                        !clinicHistories.length
                           ? setAddNoteOpen(true)
                           : setClosingModalOpen(true)
                     }
                  >
                     Finalizar servicio
                  </Button>
                  {closingError && (
                     <div className="col-span-2 w-full flex-none text-end text-error">
                        Ocurrió un error inesperado.
                     </div>
                  )}
               </div>
            )}
         </div>
      </>
   );
}

interface IShouldAddNoteModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   route: ClinicRoute;
}

function ShouldAddNoteModal({ isOpen, setIsOpen, route }: IShouldAddNoteModal) {
   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <InfoRoundedIcon className="!text-8xl text-primary" />
               <h3 className="mb-3 text-center text-base lg:text-xl">
                  Debes agregar una nota clínica antes de poder <br /> finalizar
                  esta reserva
               </h3>
               <div className="grid w-full grid-cols-2 gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setIsOpen(false)}
                  >
                     Atrás
                  </Button>
                  <Button href={route}>Agregar nota clínica</Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}


