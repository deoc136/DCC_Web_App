'use client';

import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { NewUser, TherapistWithSchedule, User } from '@/types/user';
import { AppointmentPackagesInfo } from './CreationView';
import { Headquarter } from '@/types/headquarter';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { timezone, translatePaymentMethod } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { PaymentMethod } from '@/types/appointment';
import PaymentCard from '@/components/shared/cards/PaymentCard';
import { Service } from '@/types/service';
import ServicePreviewRow from '../components/ServicePreviewRow';

interface IPreviewView {
   therapists: TherapistWithSchedule[];
   values: AppointmentPackagesInfo;
   headquarters: Headquarter[];
   patients: User[];
   newPatient: NewUser | undefined;
   services: Service[];
   selectedPackage: Package | undefined;
   invoice: { id: string; url: string } | undefined;
   setInvoice: Dispatch<
      SetStateAction<{ id: string; url: string } | undefined>
   >;
}

export default function PreviewView({
   therapists,
   headquarters,
   newPatient,
   patients,
   values,
   services,
   selectedPackage,
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
                  <p className="mb-2 font-semibold">Tipo de paquete</p>
                  <p className="text-on-background-text">
                     {selectedPackage?.name}
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
            <div>
               <p className="mb-2 font-semibold">Sesiones agregadas</p>
               {values.services.map((service, i) => (
                  <ServicePreviewRow
                     key={i}
                     index={i}
                     date={(date => {
                        return `${Intl.DateTimeFormat(undefined, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`;
                     })(new Date(service.date.toDate(timezone)))}
                     hour={
                        hours.find(
                           ({ code }) => service.hour.toString() === code,
                        )?.name ?? ''
                     }
                     therapist={
                        therapists.find(
                           ({ user: { id } }) =>
                              id.toString() ===
                              (service.therapist_id === '-1'
                                 ? service.random_therapist_id
                                 : service.therapist_id),
                        )?.user
                     }
                  />
               ))}
            </div>
         </section>
         <h2 className="font-semibold">Resumen de pago</h2>
         <section className="mx-20 grid gap-7">
            <PaymentCard
               quantity={Number(selectedPackage?.quantity ?? 0)}
               serviceName={`${service?.name} paquete de `}
               servicePrice={Number(selectedPackage?.price ?? 0)}
               taxes={0}
               invoiceUrl={
                  values.payment_method === 'ONLINE' ? invoice?.url : null
               }
            />
         </section>
      </div>
   );
}
