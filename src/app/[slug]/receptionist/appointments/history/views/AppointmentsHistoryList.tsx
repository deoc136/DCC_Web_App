'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Search } from '@mui/icons-material';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { User } from '@/types/user';
import { Service } from '@/types/service';
import { AppointmentWithNames } from '@/types/appointment';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AppointmentsHistoryTable from '../components/AppointmentsHistoryTable';
import AppointmentsFiltersModal from '@/components/shared/modals/AppointmentsFiltersModal';
import { translateAppointmentAssistance } from '@/lib/utils';

interface IAppointmentsHistoryList {
   slug: string;
   patients: User[];
   therapists: User[];
   services: Service[];
   appointments: AppointmentWithNames[];
}

export default function AppointmentsHistoryList({
   slug,
   appointments,
   patients,
   services,
   therapists,
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
                  new Date(first.appointment.date).getTime() -
                  new Date(sec.appointment.date).getTime()
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
               ).localeCompare(
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
            therapists={therapists.filter(
               ({ enabled, retired }) => enabled && !retired,
            )}
            selectedPatients={selectedPatients}
            selectedServices={selectedServices}
            selectedTherapists={selectedTherapists}
            setSelectedPatients={setSelectedPatients}
            setSelectedServices={setSelectedServices}
            setSelectedTherapists={setSelectedTherapists}
         />
         <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto] gap-10">
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
            <div>
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
