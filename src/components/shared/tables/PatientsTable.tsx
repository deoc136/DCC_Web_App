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
import { PatientWithAppointment } from '@/services/user';
import Image from 'next/image';
import { clinicRoutes } from '@/lib/routes';
import { useShowDetails } from '@/lib/hooks/useShowDetails';
import { cutFullName } from '@/lib/utils';

interface IPatientsTable {
   users: PatientWithAppointment[];
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function PatientsTable({
   users,
   directionState,
   columnState,
}: IPatientsTable) {
   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;

   const { slug } = useAppSelector(store => store.clinic);
   const role = useAppSelector(store => store.user?.role);

   const show_details = useShowDetails();

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
               <Column allowsSorting key="names">
                  Nombre del paciente
               </Column>
               <Column allowsSorting={show_details} key="phone">
                  {show_details ? 'Teléfono' : true}
               </Column>
               <Column allowsSorting={show_details} key="email">
                  {show_details ? 'Correo' : true}
               </Column>
               <Column allowsSorting key="last_appointment">
                  Fecha última reserva
               </Column>
               <Column key="details">{true}</Column>
            </TableHeader>
            <TableBody>
               {users.map(user => (
                  <Row key={user.id}>
                     <Cell>
                        <div
                           aria-label="user name"
                           className={`grid w-full max-w-sm grid-cols-5 items-center gap-3 ${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           <div className="relative aspect-square h-max w-10">
                              <Image
                                 src={
                                    user.profile_picture.length
                                       ? user.profile_picture
                                       : '/default_profile_picture.svg'
                                 }
                                 className="rounded-full object-cover object-center"
                                 alt="user image"
                                 fill
                              />
                           </div>
                           <p className="col-span-4 col-start-2 w-full justify-self-start truncate font-semibold">
                              {cutFullName(user.names, user.last_names)}
                           </p>
                        </div>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           {show_details ? user.phone : true}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           {show_details ? user.email : true}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           {user.last_appointment
                              ? (date =>
                                   `${date.getDate()}/${
                                      date.getMonth() + 1
                                   }/${date.getFullYear()}`)(
                                   new Date(user.last_appointment),
                                )
                              : 'No hay reservas'}
                        </span>
                     </Cell>
                     <Cell>
                        <Link
                           className="text-secondary underline underline-offset-2"
                           href={
                              clinicRoutes(slug)[
                                 role === 'ADMINISTRATOR'
                                    ? 'admin_patients_id'
                                    : role === 'THERAPIST'
                                    ? 'therapist_patients_id'
                                    : 'receptionist_patients_id'
                              ](user.id).details
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
