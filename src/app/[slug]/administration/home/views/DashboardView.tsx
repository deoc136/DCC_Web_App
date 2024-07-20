'use client';

import DateRangePicker from '@/components/inputs/DateRangePicker';
import Card from '@/components/shared/cards/Card';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import {
   arrayFromNumbers,
   createDateAndReturnTime,
   dayMilliseconds,
   formatPrice,
   resetDateTime,
   timezone,
} from '@/lib/utils';
import { PatientWithAppointment, editUser } from '@/services/user';
import { Appointment, AppointmentWithNames } from '@/types/appointment';
import { CalendarDateTime, today } from '@internationalized/date';
import { Fragment, ReactNode, useEffect, useState, useTransition } from 'react';
import { DateValue } from 'react-aria';
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { changeTitle } from '@/lib/features/title/title_slice';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';


interface IDashboardView {
   appointments: AppointmentWithNames[];
   patients: {
      user: PatientWithAppointment;
   }[];
}

ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
);

function isPaid({ state }: Appointment) {
   return state === 'PENDING' || state === 'CLOSED';
}

export default function DashboardView({
   appointments,
   patients,
}: IDashboardView) {
   const dispatch = useAppDispatch();

   const [loading, startTransition] = useTransition();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Dashboard',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch]);

   const minDate = new CalendarDateTime(2023, 11, 1);

   const [startDate, setStartDate] = useState<DateValue>(today(timezone));

   const [endDate, setEndDate] = useState<DateValue>(today(timezone));

   const currency = useClinicCurrency();

   function getAppointmentsFiltered() {
      return appointments.filter(({ appointment: { creation_date } }) => {
         const aux = resetDateTime(new Date(creation_date)).getTime();

         return (
            aux >= resetDateTime(startDate.toDate(timezone)).getTime() &&
            aux <= resetDateTime(endDate.toDate(timezone)).getTime()
         );
      });
   }

   function getPatientsFiltered() {
      return patients.filter(({ user: { date_created } }) => {
         const aux = resetDateTime(new Date(date_created)).getTime();

         return (
            aux >= resetDateTime(startDate.toDate(timezone)).getTime() &&
            aux <= resetDateTime(endDate.toDate(timezone)).getTime()
         );
      });
   }

   const [filteredAppointments, setFilteredAppointments] = useState(
      getAppointmentsFiltered(),
   );

   const [filteredPatients, setFilteredPatients] = useState(
      getPatientsFiltered(),
   );

   function getPatientsData() {
      const aux = {
         packagesBought: 0,
         singlesBought: 0,
      };

      filteredPatients.forEach(({ user }) => {
         let packageFound = false;
         let singleFound = false;

         appointments.some(({ appointment }) => {
            if (appointment.patient_id === user.id && isPaid(appointment)) {
               if (appointment.from_package) {
                  packageFound = true;
               } else {
                  singleFound = true;
               }

               if (packageFound && singleFound) {
                  return true;
               }
            }

            return false;
         });

         packageFound && aux.packagesBought++;
         singleFound && aux.singlesBought++;
      });

      return aux;
   }

   const [patientsData, setPatientsData] = useState(getPatientsData);

   function groupAppointments() {
      let maxNum = 0;
      let totalSold = 0;

      if (!filteredAppointments.length) return { maxNum, data: [], totalSold };

      const firstDate = resetDateTime(startDate.toDate(timezone));
      const lastDate = resetDateTime(endDate.toDate(timezone));

      const daysGap = Math.ceil(
         (lastDate.getTime() - firstDate.getTime()) / dayMilliseconds + 1,
      );

      const aux = arrayFromNumbers(0, daysGap).map(num => {
         const start = new Date(firstDate);
         start.setTime(firstDate.getTime() + dayMilliseconds * num);

         const end = new Date(firstDate);
         end.setTime(firstDate.getTime() + dayMilliseconds * (num + 1));

         const obj = {
            label: `${start.getDate()}/${start.getMonth() + 1}`,
            package: 0,
            single: 0,
            prices: [] as number[],
         };

         filteredAppointments.forEach(({ appointment }) => {
            if (isPaid(appointment)) {
               const date = resetDateTime(
                  new Date(appointment.creation_date),
               ).getTime();
               if (date >= start.getTime() && date < end.getTime()) {
                  obj.prices.push(Number(appointment.price));
                  appointment.from_package ? obj.package++ : obj.single++;
                  totalSold += Number(appointment.price);
               }
            }
         });

         if (obj.package > maxNum) {
            maxNum = obj.package;
         }

         if (obj.single > maxNum) {
            maxNum = obj.single;
         }

         return obj;
      });

      return {
         maxNum,
         data: aux,
         totalSold,
      };
   }

   interface AppointmentRank {
      [key: string]: {
         sells: number;
         earns: number;
         attended: number;
      };
   }

   function rankAppointments() {
      const aux: AppointmentRank = {};

      filteredAppointments.forEach(({ appointment, data }) => {
         if (isPaid(appointment)) {
            const prop = aux[data.service_name];

            aux[data.service_name] = {
               earns: (prop?.earns ?? 0) + Number(appointment.price),
               sells: (prop?.sells ?? 0) + 1,
               attended:
                  (prop?.attended ?? 0) +
                  (appointment.assistance === 'ATTENDED' ? 1 : 0),
            };
         }
      });

      return Object.entries(aux).sort(([_a, a], [_b, b]) =>
         b.sells !== a.sells
            ? b.sells - a.sells
            : b.earns / b.attended - a.earns / a.attended,
      );
   }

   const [labels, setLabels] = useState(
      groupAppointments().data.map(group => group.label),
   );

   const [groupedAppointments, setGroupedAppointments] = useState(
      groupAppointments(),
   );

   const [rankedAppointments, setRankedAppointments] = useState(
      rankAppointments(),
   );

   useEffect(() => {
      setFilteredAppointments(getAppointmentsFiltered());
      setFilteredPatients(getPatientsFiltered());

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [startDate, endDate]);

   useEffect(() => {
      startTransition(async () => {
         setLabels(groupAppointments().data.map(group => group.label));
         setGroupedAppointments(groupAppointments());
         setRankedAppointments(rankAppointments());
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filteredAppointments]);

   useEffect(() => {
      startTransition(async () => {
         setPatientsData(getPatientsData());
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filteredPatients]);

   return (
      <>
         {loading && (
            <div className="fixed inset-0 flex items-center justify-center">
               <RefreshRounded className="animate-spin !fill-on-background !text-6xl" />
            </div>
         )}
         <div
            className={`grid h-max grid-cols-12 grid-rows-[auto_auto_1fr] gap-5 transition-all ${
               loading && 'cursor-none opacity-50'
            }`}
         >
            <div className="col-span-4">
               <DateRangePicker
                  value={{
                     start: startDate,
                     end: endDate,
                  }}
                  onChange={val => {
                     setStartDate(val.start);
                     setEndDate(val.end);
                  }}
                  minValue={minDate}
               />
            </div>
            <div className="col-span-5" />
            <Card isShadowed className="col-span-5 shadow-none">
               <Subtitle>Reservas</Subtitle>
               <div className="grid grid-cols-3 gap-5">
                  <CardColumn
                     label="Total"
                     value={filteredAppointments.length}
                  />
                  <CardColumn
                     label="Atendidas"
                     value={
                        filteredAppointments.filter(
                           ({ appointment }) =>
                              isPaid(appointment) &&
                              appointment.assistance === 'ATTENDED',
                        ).length
                     }
                  />
                  <CardColumn
                     label="Canceladas"
                     value={
                        filteredAppointments.filter(
                           ({ appointment: { state } }) => state === 'CANCELED',
                        ).length
                     }
                  />
               </div>
            </Card>
            <Card isShadowed className="col-span-7 shadow-none">
               <Subtitle>Pacientes</Subtitle>
               <div className="grid grid-cols-4 gap-5">
                  <CardColumn
                     label="Total"
                     value={
                        patients.filter(
                           ({ user: { date_created } }) =>
                              resetDateTime(new Date(date_created)).getTime() <=
                              resetDateTime(endDate.toDate(timezone)).getTime(),
                        ).length
                     }
                  />
                  <CardColumn label="Nuevos" value={filteredPatients.length} />
                  <CardColumn
                     label="Con sesiones compradas"
                     value={patientsData.singlesBought}
                  />
                  <CardColumn
                     label="Con paquetes comprados"
                     value={patientsData.packagesBought}
                  />
               </div>
            </Card>
            <Card
               isShadowed
               className="col-span-8 grid h-max font-semibold shadow-none"
            >
               <h2 className="text-center text-lg font-semibold">
                  Total de ventas registradas
               </h2>
               <p className="mb-5 text-center text-3xl">
                  {formatPrice(groupedAppointments.totalSold, currency)}
               </p>
               <Line
                  options={{
                     responsive: true,
                     interaction: {
                        mode: 'index' as const,
                        intersect: false,
                     },
                     elements: {
                        point: {
                           borderWidth: 0,
                           backgroundColor: 'transparent',
                        },
                     },
                     scales: {
                        y: {
                           type: 'linear' as const,
                           display: true,
                           position: 'right' as const,
                           min: 0,
                           title: {
                              text: 'Ventas',
                              display: true,
                              color: '#606061',
                              font: {
                                 weight: 600,
                                 size: 14,
                              },
                           },
                           grid: {
                              drawOnChartArea: false,
                              display: false,
                           },
                        },
                        y1: {
                           type: 'linear' as const,
                           display: true,
                           position: 'left' as const,
                           max: groupedAppointments.maxNum,
                           min: 0,
                           ticks: {
                              precision: 0,
                           },
                           title: {
                              text: 'Reservas',
                              display: true,
                              color: '#606061',
                              font: {
                                 weight: 600,
                                 size: 14,
                              },
                           },
                        },
                        y2: {
                           display: false,
                           max: groupedAppointments.maxNum,
                           min: 0,
                        },
                     },
                     plugins: {
                        legend: {
                           position: 'bottom',
                        },
                     },
                  }}
                  data={{
                     labels,
                     datasets: [
                        {
                           label: `Ventas (${currency})`,
                           data: groupedAppointments.data.map(group =>
                              group.prices.reduce((a, b) => a + b, 0),
                           ),
                           borderColor: '#b0b0b0',
                           yAxisID: 'y',
                        },
                        {
                           label: 'Número de reservas individuales',
                           data: groupedAppointments.data.map(
                              group => group.single,
                           ),
                           borderColor: '#4FD1C5',
                           yAxisID: 'y1',
                        },
                        {
                           label: 'Número de reservas por paquete',
                           data: groupedAppointments.data.map(
                              group => group.package,
                           ),
                           borderColor: '#215853',
                           yAxisID: 'y2',
                        },
                     ],
                  }}
               />
            </Card>
            <Card
               isShadowed
               className="col-span-4 h-max overflow-visible shadow-none"
            >
               <div className="relative flex justify-between gap-4">
                  <Subtitle>Top 5 servicios mas vendidos</Subtitle>
                  <div className="h-max before:absolute before:bottom-full before:right-0 before:hidden before:w-64 before:rounded-lg before:bg-on-background before:bg-opacity-70 before:p-4 before:text-white before:content-['El_valor_total_vendido_puede_indicar_0_debido_a_que_se_realizó_la_transacción_fuera_del_período_seleccionado,_especialmente_si_corresponden_a_paquetes_prepagados.'] hover:before:block">
                     <HelpOutlineRoundedIcon className="cursor-pointer !fill-on-background-text" />
                  </div>
               </div>
               <div className="grid h-max grid-rows-[repeat(9,auto)]">
                  {rankedAppointments.map(
                     ([label, { earns, attended, sells }], i) => (
                        <Fragment key={label}>
                           <div className="grid h-max grid-cols-[auto_1fr] gap-x-3">
                              <p className="font-bold text-primary-variant">
                                 {i + 1}.
                              </p>
                              <div className="grid w-full grid-cols-[5fr_4fr] gap-x-5 gap-y-2 text-sm text-on-background-text">
                                 <p className="col-span-2 w-full truncate text-base font-semibold text-black">
                                    {label}
                                 </p>
                                 <p className="w-full truncate font-semibold">
                                    Sesiones vendidas
                                 </p>
                                 <p className="w-full truncate">{sells}</p>
                                 <p className="w-full truncate font-semibold">
                                    Valor promedio
                                 </p>
                                 <p className="w-full truncate">
                                    {formatPrice(
                                       sells > 0 ? earns / sells : 0,
                                       currency,
                                    )}
                                 </p>
                                 <p className="w-full truncate font-semibold">
                                    Total vendido
                                 </p>
                                 <p className="w-full truncate">
                                    {formatPrice(earns, currency)}
                                 </p>
                              </div>
                           </div>
                           {i < rankedAppointments.length - 1 && (
                              <div className="my-5 w-full border border-on-background-disabled" />
                           )}
                        </Fragment>
                     ),
                  )}
               </div>
            </Card>
         </div>
      </>
   );
}

interface ISubtitle {
   children: ReactNode;
}

function Subtitle({ children }: ISubtitle) {
   return <h2 className="mb-5 text-lg font-semibold">{children}</h2>;
}

interface ICardColumn {
   value: number;
   label: string;
}

function CardColumn({ label, value }: ICardColumn) {
   return (
      <div className="grid w-full gap-2">
         <p className="w-full truncate text-3xl font-semibold">{value}</p>
         <p className="w-full truncate text-sm text-on-background-text">
            {label}
         </p>
      </div>
   );
}
