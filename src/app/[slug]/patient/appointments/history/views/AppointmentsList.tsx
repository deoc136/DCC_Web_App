'use client';

import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { AppointmentWithNamesAndRating } from '@/types/appointment';
import AppointmentsHistoryTable from '../components/AppointmentTable';
import { Headquarter } from '@/types/headquarter';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { changeTitle } from '@/lib/features/title/title_slice';
import { Catalog } from '@/types/catalog';
import { User } from '@/types/user';
import { Service } from '@/types/service';
import { useRouter } from 'next/navigation';
import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { capitalize } from '@mui/material';
import Link from 'next/link';
import {
   translateAppointmentAssistance,
   translateAppointmentState,
} from '@/lib/utils';
import useDictionary from '@/lib/hooks/useDictionary';

interface IAppointmentsHistoryList {
   slug: string;
   appointments: AppointmentWithNamesAndRating[];
   headquarters: Headquarter[];
}

export default function AppointmentsHistoryList({
   appointments,
   headquarters,
}: IAppointmentsHistoryList) {
   const dic = useDictionary();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [page, setPage] = useState(0);
   const limit = 7;

   const [sortedAppointments, setSortedAppointments] = useState(appointments);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...appointments];

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (column) {
            case 'date':
               return (
                  new Date(first.appointment.date).getTime() -
                  new Date(sec.appointment.date).getTime()
               );
            case 'hour':
               return first.appointment.hour - sec.appointment.hour;
            case 'service':
               return first.data.service_name.localeCompare(
                  sec.data.service_name,
               );
            case 'therapist':
               return `${first.data.therapist_names} ${first.data.therapist_last_names}`.localeCompare(
                  `${sec.data.therapist_names} ${sec.data.therapist_last_names}`,
               );
            default:
               return data2.appointment.id - data1.appointment.id;
         }
      });

      setSortedAppointments(aux);
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, appointments]);

   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: dic.texts.appointments.my_appointments,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, dic]);

   return (
      <div className="flex h-full flex-col justify-between gap-10">
         <div className="hidden xl:block">
            <AppointmentsHistoryTable
               headquarters={headquarters}
               directionState={directionState}
               columnState={columnState}
               appointments={sortedAppointments.slice(
                  page * limit,
                  page * limit + limit,
               )}
            />
         </div>
         <div className="xl:hidden">
            {sortedAppointments
               .slice(page * limit, page * limit + limit)
               .map((data, i) => (
                  <AppointmentRow
                     key={i}
                     data={data}
                     headquarter={headquarters.find(
                        ({ id }) => id === data.appointment.headquarter_id,
                     )}
                  />
               ))}
         </div>
         <div />
         <Pagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(sortedAppointments.length / limit)}
         />
      </div>
   );
}

interface IAppointmentRow {
   hour?: Catalog;
   data: AppointmentWithNamesAndRating;
   therapist?: User;
   headquarter?: Headquarter;
   service?: Service;
}

function AppointmentRow({
   data: { appointment, data },
   headquarter,
   hour,
}: IAppointmentRow) {
   const dic = useDictionary();

   const date = new Date(appointment.date ?? new Date());

   const { slug } = useAppSelector(store => store.clinic);

   const hours = useAppSelector(store => store.catalogues.hours);

   return (
      <>
         <div className="grid grid-cols-[1fr_auto] items-center gap-5 py-5 text-xs text-on-background-text lg:text-sm">
            <Link
               href={
                  clinicRoutes(slug).patient_appointments_id(appointment.id)
                     .details
               }
               className="grid gap-2"
            >
               <div className="font-semibold">
                  <p className="text-sm text-black lg:text-base">
                     {data.service_name}
                  </p>
                  <p>
                     {data.therapist_names} {data.therapist_last_names}
                  </p>
               </div>
               <p>
                  <span>
                     {capitalize(
                        Intl.DateTimeFormat(dic.language, {
                           month: 'short',
                        }).format(date),
                     )}{' '}
                     {date.getDate()} / {date.getFullYear()}{' '}
                     {
                        hours.find(
                           ({ code }) => code === appointment.hour.toString(),
                        )?.name
                     }
                  </span>
               </p>
            </Link>
            {Number(appointment.ratings) > 0 ? (
               <p className="font-semibold p-basic">
                  ¡{dic.texts.appointments.rated}!
               </p>
            ) : (
               <Button
                  href={
                     clinicRoutes(slug).patient_appointments_id(appointment.id)
                        .rate
                  }
                  isDisabled={
                     appointment.state !== 'CLOSED' ||
                     appointment.assistance !== 'ATTENDED'
                  }
                  className="h-max"
                  variant={Variant.secondary}
               >
                  {appointment.state === 'CANCELED'
                     ? translateAppointmentState(appointment.state, dic)
                     : appointment.assistance === 'MISSED'
                     ? translateAppointmentAssistance(
                          appointment.assistance,
                          dic,
                       )
                     : dic.texts.appointments.rate_service}
               </Button>
            )}
         </div>
         <hr />
         <hr />
      </>
   );
}
