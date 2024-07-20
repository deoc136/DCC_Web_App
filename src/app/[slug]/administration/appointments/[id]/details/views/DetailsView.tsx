'use client';

import SubmittedFormsTable from '@/components/shared/tables/SubmittedFormsTable';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { Appointment } from '@/types/appointment';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import { Key, useEffect, useMemo, useState } from 'react';
import { SortDirection } from 'react-stately';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import { clinicRoutes } from '@/lib/routes';
import AppointmentStateChip from '@/components/shared/AppointmentStateChip';
import { changeTitle } from '@/lib/features/title/title_slice';
import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { formatPrice, translateAppointmentAssistance } from '@/lib/utils';
import usePhoneCode from '@/lib/hooks/usePhoneCode';

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

   const { hours, phone_codes } = useAppSelector(store => store.catalogues);

   const clinic = useAppSelector(store => store.clinic);

   const clinicCurrency = useClinicCurrency();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();
   const [sortedForms, setSortedForms] = useState(forms);

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
               ? clinicRoutes(clinic.slug).admin_appointments_history
               : clinicRoutes(clinic.slug).admin_appointments_actives,
            value: isClosed
               ? 'Reservas / Historial de reservas / Detalles de reserva'
               : 'Reservas / Reservas activas / Detalles de reserva',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch]);

   return (
      <div className="grid h-max gap-10">
         <h3 className="text-xl">Información de la reserva</h3>
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
                  {(date => {
                     return `${Intl.DateTimeFormat(undefined, {
                        month: 'long',
                     }).format(date)} ${date.getDate()} ${date.getFullYear()}`;
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
            {!!appointment.assistance && (
               <div>
                  <p className="mb-2 font-semibold">Asistencia del paciente</p>
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
                  clinicRoutes(clinic.slug).admin_patients_id(patient.id)
                     .details
               }
               user={patient}
            />
         </section>
         <h3 className="text-xl">Información del terapeuta</h3>
         <section className="mx-24">
            <UserOverviewCard
               code={code}
               url={
                  clinicRoutes(clinic.slug).admin_team_id(therapist.id).details
               }
               user={therapist}
            />
         </section>
         <section className="mx-24 grid gap-5">
            <h3 className="text-xl">Documentos adjuntos</h3>
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
                     clinicRoutes(clinic.slug).admin_appointments_id(
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
   );
}
