'use client';

import TextField from '@/components/inputs/TextField';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { AddRounded, HistoryRounded, Search } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { clinicRoutes } from '@/lib/routes';
import { PatientWithAppointment } from '@/services/user';
import PatientsTable from '@/components/shared/tables/PatientsTable';
import { User } from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import { cutFullName } from '@/lib/utils';

interface ITeamList {
   users: PatientWithAppointment[];
   slug: string;
}

type UserKey = keyof PatientWithAppointment;

export default function PatientsList({ users }: ITeamList) {
   const dispatch = useAppDispatch();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [search, setSearch] = useState('');

   const [page, setPage] = useState(0);
   const limit = 7;

   function filter($users: PatientWithAppointment[]) {
      return $users.filter(el =>
         search.length
            ? [el.names, el.last_names, el.phone, el.email].some(att =>
                 att.toLowerCase().includes(search.toLowerCase()),
              )
            : true,
      );
   }

   const [sortedUsers, setSortedUsers] = useState(filter(users));

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Pacientes',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setPage(0);
   }, [search, users.length]);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...users];

      const typedColumn = column as UserKey | undefined;

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (typedColumn) {
            case 'names':
               return `${first.names} ${first.last_names}`.localeCompare(
                  `${sec.names} ${sec.last_names}`,
               );
            case 'phone':
               return Number(first.phone) - Number(sec.phone);
            case 'email':
               return first.email.localeCompare(sec.email);
            case 'last_appointment':
               return (
                  new Date(first.last_appointment ?? 0).getDate() -
                  new Date(sec.last_appointment ?? 0).getDate()
               );
            default:
               return data2.id - data1.id;
         }
      });

      setSortedUsers(filter(aux));
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, users, search]);

   return (
      <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto] gap-10 text-sm lg:text-base">
         <div className="w-full text-on-background-text">
            <TextField
               aria-label="search"
               value={search}
               onChange={setSearch}
               startIcon={<Search />}
               className="w-full"
               placeholder="Buscar"
            />
         </div>
         <div className="hidden lg:block">
            <PatientsTable
               directionState={directionState}
               columnState={columnState}
               users={sortedUsers.slice(page * limit, page * limit + limit)}
            />
         </div>
         <div className="grid gap-5 lg:hidden">
            {sortedUsers.slice(page * limit, page * limit + limit).map(user => (
               <UserCard key={user.id} user={user} />
            ))}
         </div>
         <div className="h-full" />
         <Pagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(sortedUsers.length / limit)}
         />
      </div>
   );
}

interface IUserCard {
   user: PatientWithAppointment;
}

export function UserCard({ user }: IUserCard) {
   const { slug } = useAppSelector(store => store.clinic);

   return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-foundation p-4 text-on-background-text shadow-lg">
         <div className="flex gap-3">
            <div className="relative aspect-square h-max w-10 overflow-hidden rounded-full">
               <Image
                  src={
                     user.profile_picture.length
                        ? user.profile_picture
                        : '/default_profile_picture.svg'
                  }
                  alt="Profile picture"
                  className="object-cover"
                  fill
               />
            </div>
            <div>
               <p className="mb-1 w-full truncate font-semibold text-black lg:text-lg">
                  {cutFullName(user.names, user.last_names)}
               </p>
               <p className="flex w-full items-center gap-1 truncate">
                  <HistoryRounded />{' '}
                  {user.last_appointment
                     ? (date =>
                          `${date.getDate()}/${
                             date.getMonth() + 1
                          }/${date.getFullYear()}`)(
                          new Date(user.last_appointment),
                       )
                     : 'No hay reservas'}
               </p>
            </div>
         </div>
         <div>
            <Link
               href={clinicRoutes(slug).therapist_patients_id(user.id).details}
               className="w-max font-semibold !text-secondary"
            >
               Ver perfil
            </Link>
         </div>
      </div>
   );
}
