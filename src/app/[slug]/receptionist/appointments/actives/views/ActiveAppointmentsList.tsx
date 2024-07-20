'use client';

import TextField from '@/components/inputs/TextField';
import Button, { Variant } from '@/components/shared/Button';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { Search } from '@mui/icons-material';
import { Key, useEffect, useMemo, useState } from 'react';
import { Item, Section, SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { User } from '@/types/user';
import { Service } from '@/types/service';
import { AppointmentWithNames } from '@/types/appointment';
import ActiveAppointmentsTable from '../components/ActiveAppointmentsTable';
import { Select } from '@/components/inputs/Select';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { Tabs } from '@/components/shared/Tabs';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AppointmentsFiltersModal from '@/components/shared/modals/AppointmentsFiltersModal';
import AppointmentsCalendar from '@/components/shared/AppointmentsCalendar';
import { clinicRoutes } from '@/lib/routes';
import { translateAppointmentState } from '@/lib/utils';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useRouter } from 'next/navigation';
import { Popover, SelectValue } from 'react-aria-components';
import { ListBox } from '@/components/shared/ListBox';

interface IActiveAppointmentsList {
   slug: string;
   patients: User[];
   therapists: User[];
   services: Service[];
   appointments: AppointmentWithNames[];
}

enum RangeMode {
   day,
   week,
}

enum DisplayMode {
   list,
   calendar,
}

export default function ActiveAppointmentsList({
   slug,
   appointments,
   patients,
   services,
   therapists,
}: IActiveAppointmentsList) {
   const router = useRouter();

   const { hours } = useAppSelector(store => store.catalogues);

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [selectedDate, setSelectedDate] = useState(new Date());

   const [displayMode, setDisplayMode] = useState(DisplayMode.list);

   const [rangeMode, setRangeMode] = useState(RangeMode.day);

   const [search, setSearch] = useState('');

   const [page, setPage] = useState(0);
   const limit = 7;

   const [filterOpen, setFilterOpen] = useState(false);

   function filter($users: AppointmentWithNames[]) {
      return $users.filter(el =>
         search.length
            ? [
                 ...Object.values(el.data),
                 el.appointment.price,
                 (date =>
                    `${date.getDate()}/${
                       date.getMonth() + 1
                    }/${date.getFullYear()}`)(new Date(el.appointment.date)),
                 hours.find(
                    ({ code }) => el.appointment.hour.toString() === code,
                 )?.display_name,
                 translateAppointmentState(el.appointment.state),
              ].some(att => att.toLowerCase().includes(search.toLowerCase()))
            : true,
      );
   }

   const [sortedAppointments, setSortedAppointments] = useState(
      filter(appointments),
   );

   const [selectedServices, setSelectedServices] = useState<number[]>([]);
   const [selectedTherapists, setSelectedTherapists] = useState<number[]>([]);
   const [selectedPatients, setSelectedPatients] = useState<number[]>([]);

   const weekStartDate = useMemo(() => {
      const aux = new Date(selectedDate);

      aux.setDate(aux.getDate() - (aux.getDay() === 0 ? 6 : aux.getDay() - 1));

      return aux;

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [rangeMode, selectedDate]);

   const weekEndDate = useMemo(() => {
      const aux = new Date(selectedDate);

      aux.setDate(
         aux.getDate() + (7 - (aux.getDay() === 0 ? 7 : aux.getDay())),
      );

      return aux;

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [rangeMode, selectedDate]);

   function filterAppointments(arr: AppointmentWithNames[]) {
      return arr.filter(
         ({
            appointment: { date, state, service_id, patient_id, therapist_id },
         }) => {
            if (state !== 'TO_PAY' && state !== 'PENDING') {
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

            const aux = new Date(date);
            if (Number(rangeMode) === RangeMode.day) {
               return (
                  aux.getFullYear() === selectedDate.getFullYear() &&
                  aux.getMonth() === selectedDate.getMonth() &&
                  aux.getDate() === selectedDate.getDate()
               );
            } else {
               return (
                  aux.getTime() >= weekStartDate.getTime() &&
                  aux.getTime() <= weekEndDate.getTime()
               );
            }
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
               return translateAppointmentState(
                  first.appointment.state,
               ).localeCompare(
                  translateAppointmentState(sec.appointment.state),
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
            <div className="grid grid-cols-[3fr_1fr] gap-5 text-on-background-text">
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
               <Select
                  staticWidth
                  triggerContent={
                     <div className="flex w-min items-center justify-center gap-2">
                        <AddRoundedIcon />
                        Crear reserva
                     </div>
                  }
                  onSelectionChange={route =>
                     !!route && router.push(route.toString())
                  }
               >
                  <Item
                     aria-label="single"
                     textValue="Cita individual"
                     key={
                        clinicRoutes(slug)
                           .receptionist_appointments_actives_create_single
                     }
                  >
                     <div className="w-full py-3 pl-8">Cita individual</div>
                  </Item>
                  <Item
                     aria-label="package"
                     textValue="Reservar paquete"
                     key={
                        clinicRoutes(slug)
                           .receptionist_appointments_actives_create_package
                     }
                  >
                     <div className="w-full py-3 pl-8">Reservar paquete</div>
                  </Item>
               </Select>
            </div>
            <div>
               <div className="mb-5 grid grid-cols-[auto_auto_1fr_auto] items-end gap-2">
                  <div
                     className={`${
                        displayMode === DisplayMode.calendar && 'invisible'
                     } flex items-center gap-2`}
                  >
                     <Button
                        aria-label="subtract day"
                        className="!w-min !bg-transparent !p-0"
                        onPress={() =>
                           setSelectedDate(prev => {
                              const aux = new Date(prev);

                              aux.setDate(
                                 aux.getDate() -
                                    (Number(rangeMode) === RangeMode.day
                                       ? 1
                                       : 7 + (aux.getDay() - 1)),
                              );

                              return aux;
                           })
                        }
                     >
                        <ChevronLeftRoundedIcon className="!fill-on-background-text !text-5xl" />
                     </Button>
                     <div className=" text-3xl font-semibold">
                        {Intl.DateTimeFormat(undefined, {
                           month: 'long',
                        }).format(selectedDate)}{' '}
                        {selectedDate.getDate()} {selectedDate.getFullYear()}
                     </div>
                     <Button
                        aria-label="add day"
                        className="!w-min !bg-transparent !p-0"
                        onPress={() =>
                           setSelectedDate(prev => {
                              const aux = new Date(prev);

                              aux.setDate(
                                 aux.getDate() +
                                    (Number(rangeMode) === RangeMode.day
                                       ? 1
                                       : 7 - (aux.getDay() - 1)),
                              );

                              return aux;
                           })
                        }
                     >
                        <ChevronRightRoundedIcon className="!fill-on-background-text !text-5xl" />
                     </Button>
                  </div>
                  <div
                     className={`${
                        displayMode === DisplayMode.calendar && 'invisible'
                     } `}
                  >
                     <Select
                        className="!bg-white-background !text-black shadow"
                        selectedKey={rangeMode.toString()}
                        onSelectionChange={val =>
                           val && setRangeMode(Number(val))
                        }
                     >
                        <Item
                           aria-label="today"
                           textValue="Hoy"
                           key={RangeMode.day}
                        >
                           <div className="w-full py-3 pl-8">Hoy</div>
                        </Item>
                        <Item
                           aria-label="week"
                           textValue="Semana"
                           key={RangeMode.week}
                        >
                           <div className="w-full py-3 pl-8">Semana</div>
                        </Item>
                     </Select>
                  </div>
                  <div />
                  <div>
                     <Tabs
                        onSelectionChange={key => setDisplayMode(Number(key))}
                        noTabPanel
                        defaultSelectedKey={DisplayMode.list.toString()}
                        aria-label="tabs container"
                        selectedKey={displayMode.toString()}
                     >
                        <Item
                           aria-label="list"
                           key={DisplayMode.list}
                           title={
                              <div className="flex items-end gap-2">
                                 <FormatListBulletedRoundedIcon /> Lista
                              </div>
                           }
                        >
                           {true}
                        </Item>
                        <Item
                           aria-label="calendar"
                           key={DisplayMode.calendar}
                           title={
                              <div className="flex items-end gap-2">
                                 <CalendarMonthRoundedIcon /> Calendario
                              </div>
                           }
                        >
                           {true}
                        </Item>
                     </Tabs>
                  </div>
               </div>
               {Number(displayMode) === DisplayMode.calendar ? (
                  <AppointmentsCalendar
                     redirectionUrl={id =>
                        clinicRoutes(slug).receptionist_appointments_id(id)
                           .details
                     }
                     appointments={sortedAppointments.filter(
                        ({
                           appointment: {
                              date,
                              state,
                              service_id,
                              patient_id,
                              therapist_id,
                           },
                        }) => {
                           if (state !== 'TO_PAY' && state !== 'PENDING') {
                              return false;
                           }

                           if (
                              (selectedServices.length &&
                                 !selectedServices.some(
                                    service =>
                                       Number(service) === Number(service_id),
                                 )) ||
                              (selectedTherapists.length &&
                                 !selectedTherapists.some(
                                    therapist =>
                                       Number(therapist) ===
                                       Number(therapist_id),
                                 )) ||
                              (selectedPatients.length &&
                                 !selectedPatients.some(
                                    patient =>
                                       Number(patient) === Number(patient_id),
                                 ))
                           ) {
                              return false;
                           }

                           return true;
                        },
                     )}
                  />
               ) : (
                  <ActiveAppointmentsTable
                     directionState={directionState}
                     columnState={columnState}
                     appointments={shownAppointments.slice(
                        page * limit,
                        page * limit + limit,
                     )}
                  />
               )}
            </div>
            {Number(displayMode) === DisplayMode.list && (
               <>
                  <div className="h-full" />
                  <Pagination
                     page={page}
                     setPage={setPage}
                     totalPages={Math.ceil(shownAppointments.length / limit)}
                  />
               </>
            )}
         </div>
      </>
   );
}
