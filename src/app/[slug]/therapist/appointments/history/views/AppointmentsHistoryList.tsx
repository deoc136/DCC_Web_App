'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import {
   BlockRounded,
   CheckCircleRounded,
   CloseRounded,
   Search,
} from '@mui/icons-material';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { User } from '@/types/user';
import { Service } from '@/types/service';
import { AppointmentWithNames } from '@/types/appointment';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AppointmentsHistoryTable from '../components/AppointmentsHistoryTable';
import AppointmentsFiltersModal from '@/components/shared/modals/AppointmentsFiltersModal';
import {
   capitalizeFirstLetter,
   createDateAndReturnTime,
   translateAppointmentAssistance,
} from '@/lib/utils';
import Card from '@/components/shared/cards/Card';
import { clinicRoutes } from '@/lib/routes';
import Link from 'next/link';
import { Catalog } from '@/types/catalog';
import { useRouter } from 'next/navigation';

interface IAppointmentsHistoryList {
   slug: string;
   patients: User[];
   services: Service[];
   appointments: AppointmentWithNames[];
}

export default function AppointmentsHistoryList({
   appointments,
   patients,
   services,
}: IAppointmentsHistoryList) {
   const { hours } = useAppSelector(store => store.catalogues);

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [search, setSearch] = useState('');

   const [page, setPage] = useState(0);
   const limit = 7;

   const [filterOpen, setFilterOpen] = useState(false);

   function filter($users: AppointmentWithNames[]) {
      return $users.filter(el =>
         search.length
            ? [
                 ...Object.values(el.data),
                 (date =>
                    `${date.getDate()}/${
                       date.getMonth() + 1
                    }/${date.getFullYear()}`)(new Date(el.appointment.date)),
                 el.appointment.price,
                 Intl.DateTimeFormat(undefined, {
                    month: 'long',
                 }).format(new Date(el.appointment.date)),
                 hours.find(
                    ({ code }) => el.appointment.hour.toString() === code,
                 )?.display_name,
                 translateAppointmentAssistance(el.appointment.assistance),
              ].some(att => att?.toLowerCase()?.includes(search?.toLowerCase()))
            : true,
      );
   }

   const [sortedAppointments, setSortedAppointments] = useState(
      filter(appointments),
   );

   const [selectedServices, setSelectedServices] = useState<number[]>([]);
   const [selectedTherapists, setSelectedTherapists] = useState<number[]>([]);
   const [selectedPatients, setSelectedPatients] = useState<number[]>([]);

   function filterAppointments(arr: AppointmentWithNames[]) {
      return arr.filter(
         ({ appointment: { state, service_id, patient_id, therapist_id } }) => {
            if (state === 'TO_PAY' || state === 'PENDING') {
               return false;
            }

            if (
               (selectedServices.length &&
                  !selectedServices.some(
                     service => Number(service) === Number(service_id),
                  )) ||
               (selectedTherapists.length &&
                  !selectedTherapists.some(
                     therapist => Number(therapist) === Number(therapist_id),
                  )) ||
               (selectedPatients.length &&
                  !selectedPatients.some(
                     patient => Number(patient) === Number(patient_id),
                  ))
            ) {
               return false;
            }

            return true;
         },
      );
   }

   const shownAppointments = filterAppointments(sortedAppointments);

   useEffect(() => {
      setPage(0);
   }, [search, shownAppointments.length]);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...appointments];

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (column) {
            case 'date':
               return (
                  createDateAndReturnTime(
                     sec.appointment.date,
                     sec.appointment.hour,
                  ) -
                  createDateAndReturnTime(
                     first.appointment.date,
                     first.appointment.hour,
                  )
               );
            case 'hour':
               return first.appointment.hour - sec.appointment.hour;
            case 'patient':
               return `${first.data.patient_names} ${first.data.patient_last_names}`.localeCompare(
                  `${sec.data.patient_names} ${sec.data.patient_last_names}`,
               );
            case 'phone':
               return (
                  Number(first.data.patient_phone) -
                  Number(sec.data.patient_phone)
               );
            case 'service':
               return first.data.service_name.localeCompare(
                  sec.data.service_name,
               );
            case 'therapist':
               return `${first.data.therapist_names} ${first.data.therapist_last_names}`.localeCompare(
                  `${sec.data.therapist_names} ${sec.data.therapist_last_names}`,
               );
            case 'payment':
               return first.appointment.payment_method.localeCompare(
                  sec.appointment.payment_method,
               );
            case 'state':
               return translateAppointmentAssistance(
                  first.appointment.assistance,
               )?.localeCompare(
                  translateAppointmentAssistance(sec.appointment.assistance),
               );
            default:
               return data2.appointment.id - data1.appointment.id;
         }
      });

      setSortedAppointments(filter(aux));
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, appointments, search]);

   return (
      <>
         <AppointmentsFiltersModal
            isOpen={filterOpen}
            setIsOpen={setFilterOpen}
            services={services.filter(
               ({ active, removed }) => active && !removed,
            )}
            patients={patients.filter(
               ({ enabled, retired }) => enabled && !retired,
            )}
            selectedPatients={selectedPatients}
            selectedServices={selectedServices}
            selectedTherapists={selectedTherapists}
            setSelectedPatients={setSelectedPatients}
            setSelectedServices={setSelectedServices}
            setSelectedTherapists={setSelectedTherapists}
         />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto] gap-5">
            <div className="w-full text-on-background-text">
               <TextField
                  aria-label="search"
                  value={search}
                  onChange={setSearch}
                  startIcon={<Search />}
                  className="w-full"
                  placeholder="Buscar"
                  endIcon={
                     <Button
                        onPress={() => setFilterOpen(true)}
                        className="flex items-center gap-3 !bg-transparent !p-0"
                        variant={Variant.secondary}
                     >
                        Filtrar <TuneRoundedIcon />
                     </Button>
                  }
               />
            </div>
            <div className="hidden lg:block">
               <h2 className="mb-5 text-2xl font-semibold">
                  Historial de reservas
               </h2>
               <AppointmentsHistoryTable
                  directionState={directionState}
                  columnState={columnState}
                  appointments={shownAppointments.slice(
                     page * limit,
                     page * limit + limit,
                  )}
               />
            </div>
            <div className="grid lg:hidden">
               {shownAppointments
                  .sort(
                     ({ appointment: a1 }, { appointment: a2 }) =>
                        createDateAndReturnTime(a2.date, a2.hour) -
                        createDateAndReturnTime(a1.date, a1.hour),
                  )
                  .slice(page * limit, page * limit + limit)
                  .map((data, i) => (
                     <AppointmentRow
                        key={i}
                        data={data}
                        hour={hours.find(
                           ({ code }) =>
                              code === data.appointment.hour.toString(),
                        )}
                        service={services.find(
                           ({ id }) => id === data.appointment.service_id,
                        )}
                        patient={patients.find(
                           ({ id }) => id === data.appointment.patient_id,
                        )}
                     />
                  ))}
            </div>
            <div className="h-full" />
            <Pagination
               page={page}
               setPage={setPage}
               totalPages={Math.ceil(shownAppointments.length / limit)}
            />
         </div>
      </>
   );
}

interface IAppointmentRow {
   hour?: Catalog;
   data: AppointmentWithNames;
   service?: Service;
   patient?: User;
}

function AppointmentRow({ data, hour, service, patient }: IAppointmentRow) {
   const router = useRouter();

   const date = new Date(data.appointment.date ?? new Date());

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <Button
         className="!bg-transparent !p-0"
         onPress={() =>
            router.push(
               clinicRoutes(slug).therapist_appointments_id(
                  data.appointment.id ?? 0,
               ).details,
            )
         }
      >
         <div className="grid grid-cols-[1fr_auto] gap-5 border-b border-b-on-background-disabled !bg-transparent !px-5 !py-6 text-start font-normal">
            <div className="flex w-full flex-col truncate text-on-background-text">
               <div>
                  {capitalizeFirstLetter(
                     Intl.DateTimeFormat(undefined, {
                        month: 'short',
                     }).format(date),
                  )}{' '}
                  / {date.getFullYear()} {hour?.name}
               </div>
               <h3 className="w-max truncate text-base font-semibold text-black">
                  {service?.name}
               </h3>
               <p className="w-full truncate">
                  {patient?.names} {patient?.last_names}
               </p>
            </div>
            <p
               className={`flex w-full items-center gap-1 truncate font-semibold ${
                  data.appointment.assistance === 'ATTENDED'
                     ? '!text-success'
                     : '!text-on-background-text'
               }`}
            >
               {data.appointment.assistance === 'ATTENDED' ? (
                  <CheckCircleRounded />
               ) : (
                  <BlockRounded />
               )}{' '}
               {translateAppointmentAssistance(data.appointment.assistance)}
            </p>
         </div>
      </Button>
   );
}
