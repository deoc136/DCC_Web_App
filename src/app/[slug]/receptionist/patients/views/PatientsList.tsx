'use client';

import TextField from '@/components/inputs/TextField';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { Search } from '@mui/icons-material';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { PatientWithAppointment } from '@/services/user';
import PatientsTable from '@/components/shared/tables/PatientsTable';

interface ITeamList {
   users: PatientWithAppointment[];
   slug: string;
}

type UserKey = keyof PatientWithAppointment;

export default function PatientsList({ users, slug }: ITeamList) {
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
      <div className="grid h-max min-h-full grid-rows-[auto_auto_1fr_auto] gap-10">
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
         <PatientsTable
            directionState={directionState}
            columnState={columnState}
            users={sortedUsers.slice(page * limit, page * limit + limit)}
         />
         <div className="h-full" />
         <Pagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(sortedUsers.length / limit)}
         />
      </div>
   );
}
