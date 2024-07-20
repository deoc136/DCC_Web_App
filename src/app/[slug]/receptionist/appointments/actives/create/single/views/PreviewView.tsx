'use client';

import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { NewUser, TherapistWithSchedule, User } from '@/types/user';
import { NewAppointmentWithDate } from './CreationView';
import { Headquarter } from '@/types/headquarter';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { timezone, translatePaymentMethod } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { PaymentMethod } from '@/types/appointment';
import PaymentCard from '@/components/shared/cards/PaymentCard';
import { Service } from '@/types/service';

interface IPreviewView {
   therapists: TherapistWithSchedule[];
   randomTherapist: string | undefined;
   values: NewAppointmentWithDate;
   headquarters: Headquarter[];
   patients: User[];
   newPatient: NewUser | undefined;
   services: Service[];
   invoice: { id: string; url: string } | undefined;
   setInvoice: Dispatch<
      SetStateAction<{ id: string; url: string } | undefined>
   >;
}

export default function PreviewView({
   randomTherapist,
   therapists,
   headquarters,
   newPatient,
   patients,
   values,
   services,
   invoice,
}: IPreviewView) {
   const phoneCode = usePhoneCode();

   const { hours } = useAppSelector(store => store.catalogues);

   const patient = useMemo(
      () => patients.find(user => user.id.toString() === values.patient_id),
      [patients, values.patient_id],
   );

   const headquarter = useMemo(
      () =>
         headquarters.find(
            headquarter => headquarter.id?.toString() === values.headquarter_id,
         ),
      [headquarters, values.headquarter_id],
   );

   const service = useMemo(
      () =>
         services.find(service => service.id?.toString() === values.service_id),
      [services, values.service_id],
   );

   return (
      <div className="mb-10 grid gap-10">
         <h2 className="font-semibold">Detalles de la reserva</h2>
         <section className="mx-20 grid gap-7">
            <div className="grid grid-cols-2 gap-5">
               <div>
                  <p className="mb-2 font-semibold">Fecha</p>
                  <p className="text-on-background-text">
                     {(date => {
                        return `${Intl.DateTimeFormat(undefined, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`;
                     })(new Date(values.date.toDate(timezone)))}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Hora</p>
                  <p className="text-on-background-text">
                     {
                        hours.find(
                           ({ code }) => values.hour.toString() === code,
                        )?.name
                     }
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Lugar del servicio</p>
                  <p className="text-on-background-text">
                     {headquarter!.name} -{' '}
                     {headquarter!.index > 0
                        ? `Sede ${headquarter!.index + 1}`
                        : 'Sede principal'}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Método de pago</p>
                  <p className="text-on-background-text">
                     {translatePaymentMethod(
                        values.payment_method as PaymentMethod,
                     )}
                  </p>
               </div>
            </div>
            <div>
               <p className="mb-2 font-semibold">Paciente</p>
               <UserOverviewCard
                  user={
                     newPatient
                        ? {
                             ...newPatient,
                          }
                        : {
                             ...patient!,
                          }
                  }
                  code={phoneCode}
               />
            </div>
            {
               <div>
                  <p className="mb-2 font-semibold">Terapeuta</p>
                  <UserOverviewCard
                     user={
                        therapists.find(
                           ({ user: { id } }) =>
                              id.toString() ===
                              (values.therapist_id === '-1'
                                 ? randomTherapist
                                 : values.therapist_id),
                        )!.user
                     }
                     code={phoneCode}
                  />
               </div>
            }
         </section>
         <h2 className="font-semibold">Resumen de pago</h2>
         <section className="mx-20 grid gap-7">
            <PaymentCard
               quantity={1}
               serviceName={service?.name ?? ''}
               servicePrice={Number(service?.price ?? 0)}
               taxes={0}
               invoiceUrl={
                  values.payment_method === 'ONLINE' ? invoice?.url : null
               }
            />
         </section>
      </div>
   );
}
