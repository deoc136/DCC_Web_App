'use client';

import TextField from '@/components/inputs/TextField';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { AddRounded, Search } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import TeamTable from '../components/TeamTable';
import { User } from '@/types/user';
import { clinicRoutes } from '@/lib/routes';

interface ITeamList {
   baseUsers: User[];
   slug: string;
}

type UserKey = keyof User;

export default function TeamList({ baseUsers, slug }: ITeamList) {
   const router = useRouter();

   const administrator_id = useAppSelector(
      store => store.clinic.administrator_id,
   );

   const dispatch = useAppDispatch();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [search, setSearch] = useState('');
   const [users, setUsers] = useState(
      baseUsers.filter(user => user.cognito_id !== administrator_id),
   );

   const [page, setPage] = useState(0);
   const limit = 7;

   function filter($users: User[]) {
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
            value: 'Equipo',
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
            case 'enabled':
               return Number(first.enabled) - Number(sec.enabled);
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
         <div className="grid grid-cols-[3fr_1fr] gap-5 text-on-background-text">
            <TextField
               aria-label="search"
               value={search}
               onChange={setSearch}
               startIcon={<Search />}
               className="w-full"
               placeholder="Buscar"
            />
            <Button
               href={clinicRoutes(slug).admin_team_create}
               className="flex items-center justify-center gap-2 !px-10 "
            >
               <AddRounded />
               Crear usuario
            </Button>
         </div>
         <TeamTable
            directionState={directionState}
            columnState={columnState}
            users={sortedUsers.slice(page * limit, page * limit + limit)}
            setUsers={setUsers}
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
