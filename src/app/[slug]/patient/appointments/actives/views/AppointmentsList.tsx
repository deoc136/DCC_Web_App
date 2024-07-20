'use client';

import Button, { Variant } from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
import Card from '@/components/shared/cards/Card';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import useDictionary from '@/lib/hooks/useDictionary';
import { clinicRoutes } from '@/lib/routes';
import { capitalizeFirstLetter, createDateAndReturnTime } from '@/lib/utils';
import {
   Appointment,
   Appointment as AppointmentRow,
} from '@/types/appointment';
import { Catalog } from '@/types/catalog';
import { Headquarter } from '@/types/headquarter';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface IAppointmentsList {
   services: Service[];
   appointments: AppointmentRow[];
   headquarters: Headquarter[];
   therapists: User[];
}

export default function AppointmentsList({
   appointments,
   headquarters,
   services,
   therapists,
}: IAppointmentsList) {
   const dic = useDictionary();

   const hours = useAppSelector(store => store.catalogues.hours);

   const dispatch = useAppDispatch();

   const [page, setPage] = useState(0);
   const limit = 7;

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: dic.texts.appointments.my_appointments,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, dic]);

   function groupByMonth(appointments: AppointmentRow[]) {
      const aux = {} as { [k: string]: AppointmentRow[] };

      appointments.forEach(appointment => {
         const date = new Date(appointment.date);

         const prop = `${date.getMonth()}/${date.getFullYear()}`;

         if (!!aux[prop]) {
            aux[prop].push(appointment);
         } else {
            aux[prop] = [appointment];
         }
      });

      return Object.entries(aux);
   }

   return (
      <div className="flex h-full flex-col justify-between gap-5 md:gap-10 xl:pr-24">
         <div className="grid gap-5 sm:gap-10">
            {groupByMonth(
               appointments
                  .sort(
                     (a, b) =>
                        createDateAndReturnTime(a.date, Number(a.hour)) -
                        createDateAndReturnTime(b.date, Number(b.hour)),
                  )
                  .slice(page * limit, page * limit + limit),
            ).map(el => {
               const date = new Date(el[1].at(-1)?.date ?? 0);
               return (
                  <>
                     <p className="hidden font-semibold text-black sm:block lg:text-lg">
                        {capitalizeFirstLetter(
                           Intl.DateTimeFormat(dic.language, {
                              month: 'long',
                           }).format(date),
                        )}{' '}
                        {date.getFullYear()}
                     </p>
                     {el[1].map((appointment, i) => (
                        <AppointmentRow
                           key={i}
                           appointment={appointment}
                           headquarter={headquarters.find(
                              ({ id }) => id === appointment.headquarter_id,
                           )}
                           hour={hours.find(
                              ({ code }) =>
                                 code === appointment.hour.toString(),
                           )}
                           service={services.find(
                              ({ id }) => id === appointment.service_id,
                           )}
                           therapist={therapists.find(
                              ({ id }) => appointment.therapist_id === id,
                           )}
                        />
                     ))}
                  </>
               );
            })}
         </div>
         <div>
            <Pagination
               page={page}
               setPage={setPage}
               totalPages={Math.ceil(appointments.length / limit)}
            />
         </div>
      </div>
   );
}

interface IAppointmentRow {
   hour?: Catalog;
   appointment?: Appointment;
   therapist?: User;
   headquarter?: Headquarter;
   service?: Service;
}

function AppointmentRow({
   appointment,
   headquarter,
   therapist,
   hour,
   service,
}: IAppointmentRow) {
   const dic = useDictionary();

   const date = new Date(appointment?.date ?? new Date());

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <>
         <Link
            className="sm:hidden"
            // target="_blank"
            href={
               clinicRoutes(slug).patient_appointments_id(appointment?.id ?? 0)
                  .details
            }
         >
            <Card className="grid grid-cols-[auto_1fr] gap-5 text-sm text-on-background-text">
               <div className="flex flex-col items-center gap-5">
                  <p className="text-base font-semibold">
                     {Intl.DateTimeFormat(dic.language, {
                        month: 'short',
                     })
                        .format(date)
                        .toUpperCase()}{' '}
                     / {date.getFullYear().toString().slice(2)}
                  </p>
                  <p className="text-3xl font-semibold">{date.getDate()}</p>
                  <p>{hour?.name}</p>
               </div>
               <div className="grid justify-between">
                  <div>
                     <h2 className="text-sm font-semibold text-black">
                        {service?.name}
                     </h2>
                     <h3 className="text-xs">
                        {therapist?.names} {therapist?.last_names}
                     </h3>
                  </div>
                  <p className="font-semibold text-[#38948C]">
                     <LocationOnRoundedIcon /> {headquarter?.name}
                  </p>
                  <p className="w-full truncate">{service?.description}</p>
               </div>
            </Card>
         </Link>
         <div className="hidden grid-cols-[auto_1fr] gap-5 text-on-background-text sm:grid">
            <div>
               <p>
                  {`${date.getDate()}/${
                     date.getMonth() + 1
                  }/${date.getFullYear()}`}
               </p>
               <p>
                  {Intl.DateTimeFormat(dic.language, {
                     weekday: 'long',
                  }).format(date)}
               </p>
               <p>{hour?.name}</p>
            </div>
            <div className="grid gap-3">
               <div className="flex justify-between">
                  <div>
                     <h2 className="text-lg font-semibold text-black">
                        {service?.name}
                     </h2>
                     <h3 className="text-base">
                        {therapist?.names} {therapist?.last_names}
                     </h3>
                  </div>
                  <Button
                     className="h-max w-max flex-none !px-9"
                     variant={Variant.secondary}
                     href={
                        appointment &&
                        clinicRoutes(slug).patient_appointments_id(
                           appointment.id,
                        ).details
                     }
                  >
                     {dic.texts.flows.see_details}
                  </Button>
               </div>
               <div className="w-full truncate border-b border-on-background-text" />
               <p>{service?.description}</p>
            </div>
         </div>
      </>
   );
}
