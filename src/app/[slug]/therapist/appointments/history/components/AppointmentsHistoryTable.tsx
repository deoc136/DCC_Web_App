'use client';

import Table from '@/components/table/Table';
import {
   Cell,
   Column,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import Link from 'next/link';
import { Dispatch, Key, SetStateAction } from 'react';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { AppointmentWithNames } from '@/types/appointment';
import { cutFullName, translateAppointmentAssistance } from '@/lib/utils';

interface IAppointmentsHistoryTable {
   appointments: AppointmentWithNames[];
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function AppointmentsHistoryTable({
   appointments,
   directionState,
   columnState,
}: IAppointmentsHistoryTable) {
   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;

   const { slug } = useAppSelector(store => store.clinic);
   const { hours } = useAppSelector(store => store.catalogues);

   return (
      <>
         <Table
            className="w-full"
            selectionMode="none"
            onSortChange={desc => {
               setDirection(prev =>
                  prev === 'ascending' ? 'descending' : 'ascending',
               );
               setColumn(desc.column);
            }}
            sortDescriptor={{ column, direction }}
         >
            <TableHeader>
               <Column allowsSorting key="date">
                  Fecha
               </Column>
               <Column allowsSorting key="hour">
                  Hora
               </Column>
               <Column allowsSorting key="patient">
                  Paciente
               </Column>
               <Column allowsSorting key="service">
                  Servicio
               </Column>
               <Column allowsSorting key="state">
                  Asistencia
               </Column>
               <Column key="details">{true}</Column>
            </TableHeader>
            <TableBody>
               {appointments.map(({ appointment, data }) => (
                  <Row key={appointment.id}>
                     <Cell>
                        {(date => {
                           return `${date.getDate()}/${
                              date.getMonth() + 1
                           }/${date.getFullYear()}`;
                        })(new Date(appointment.date))}
                     </Cell>
                     <Cell>
                        {
                           hours.find(
                              ({ code }) =>
                                 appointment.hour.toString() === code,
                           )?.display_name
                        }
                     </Cell>
                     <Cell>
                        {cutFullName(
                           data.patient_names,
                           data.patient_last_names,
                        )}
                     </Cell>
                     <Cell>{data.service_name}</Cell>
                     <Cell>
                        {translateAppointmentAssistance(appointment.assistance)}
                     </Cell>
                     <Cell>
                        <Link
                           className="text-secondary underline underline-offset-2"
                           href={
                              clinicRoutes(slug).therapist_appointments_id(
                                 appointment.id,
                              ).details
                           }
                        >
                           Ver detalles
                        </Link>
                     </Cell>
                  </Row>
               ))}
            </TableBody>
         </Table>
      </>
   );
}
