'use client';

import { Service } from '@/types/service';
import { TherapistWithSchedule, User } from '@/types/user';
import { NewAppointmentWithDate } from './CreationView';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import { secondsToTimeExtended, timezone } from '@/lib/utils';
import { useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Headquarter } from '@/types/headquarter';
import PaymentResume from '../components/PaymentResume';
import Image from 'next/image';
import useDictionary from '@/lib/hooks/useDictionary';

interface IReviewView {
   values: NewAppointmentWithDate;
   service: Service;
   therapists: TherapistWithSchedule[];
   randomTherapist: string | undefined;
   headquarters: Headquarter[];
}

export default function ReviewView({
   service,
   therapists,
   values,
   randomTherapist,
   headquarters,
}: IReviewView) {
   const dic = useDictionary();

   const phoneCode = usePhoneCode();

   const hours = useAppSelector(store => store.catalogues.hours);

   const selectedHour = useMemo(
      () => hours.find(({ code }) => Number(code) === Number(values.hour)),
      [values.hour, hours],
   );

   const selectedHeadquarter = useMemo(
      () => headquarters.find(({ id }) => id === Number(values.headquarter_id)),
      [values.headquarter_id, headquarters],
   );

   return (
      <div className="grid gap-5 md:grid-cols-7 lg:grid-cols-5 lg:gap-10">
         <section className="grid gap-5 text-on-background-text md:col-start-1 md:col-end-5 lg:col-end-4">
            <div className="relative aspect-[350/254] w-full sm:aspect-[350/154] lg:aspect-[622/192]">
               <Image
                  className="object-cover object-center"
                  fill
                  alt="service image"
                  src={
                     service.picture_url?.length
                        ? service.picture_url
                        : '/default_service_image.png'
                  }
               />
            </div>
            <h2 className="text-base font-semibold text-black lg:text-lg">
               {service.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs lg:text-sm">
               <div>
                  <p className="mb-2 label">{dic.texts.attributes.date}:</p>
                  <p>
                     {(date => {
                        return `${Intl.DateTimeFormat(dic.language, {
                           month: 'long',
                        }).format(
                           date,
                        )} ${date.getDate()} ${date.getFullYear()}`;
                     })(new Date(values.date.toDate(timezone)))}
                  </p>
               </div>
               <div>
                  <p className="mb-2 label">{dic.texts.attributes.duration}:</p>
                  <p>
                     {secondsToTimeExtended(
                        Number(service.service_duration),
                        dic,
                     )}
                  </p>
               </div>
               <div>
                  <p className="mb-2 label">{dic.texts.attributes.hour}:</p>
                  <p>
                     {selectedHour?.name} -{' '}
                     {(hour => (hour ? hour.name : '11:00 PM'))(
                        hours.find(
                           ({ code }) =>
                              Number(code) === Number(values.hour) + 1,
                        ),
                     )}
                  </p>
               </div>
               <div>
                  <p className="mb-2 label">{dic.texts.attributes.address}:</p>
                  <p>{selectedHeadquarter?.address}</p>
               </div>
            </div>
            <div>
               <p className="mb-2 label">{dic.texts.attributes.therapist}</p>
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
            <div>
               <p className="mb-2 label">{dic.texts.attributes.description}</p>
               <p>{service.description}</p>
            </div>
         </section>
         <section className="md:col-span-full md:col-start-5 lg:col-start-4 lg:col-end-6">
            <PaymentResume
               quantity={1}
               serviceName={service?.name ?? ''}
               servicePrice={Number(service?.price ?? 0)}
               taxes={0}
            />
         </section>
      </div>
   );
}
