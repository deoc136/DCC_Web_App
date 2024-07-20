'use client';

import TextField from '@/components/inputs/TextField';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { SORoutes } from '@/lib/routes';
import { Clinic, ClinicPopulated } from '@/types/clinic';
import { AddRounded, Search } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import ClinicsTable from './ClinicsTable';
import Pagination from '@/components/shared/Pagination';

interface IClinicsListOverview {
   baseClinics: ClinicPopulated[];
}

type ClinicKey = keyof Clinic;

export default function ClinicsListOverview({
   baseClinics,
}: IClinicsListOverview) {
   const router = useRouter();

   const dispatch = useAppDispatch();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [search, setSearch] = useState('');
   const [clinics, setClinics] = useState(baseClinics);

   const [page, setPage] = useState(0);
   const limit = 7;

   function filter($clinics: ClinicPopulated[]) {
      return $clinics.filter(el =>
         search.length
            ? el.clinic.name.toLowerCase().includes(search.toLowerCase())
            : true,
      );
   }

   const [sortedClinics, setSortedClinics] = useState(filter(clinics));

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Administrar clínica',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setPage(0);
   }, [search, clinics.length]);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...clinics];

      const typedColumn = column as ClinicKey | undefined;

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (typedColumn) {
            case 'name':
               return first.clinic.name.localeCompare(sec.clinic.name);
            case 'identification':
               return first.clinic.identification.localeCompare(
                  sec.clinic.identification,
               );
            case 'country':
               return first.country.name.localeCompare(sec.country.name);
            case 'identification_id':
               return first.identification_type.name.localeCompare(
                  sec.identification_type.name,
               );
            case 'active':
               return Number(first.clinic.active) - Number(sec.clinic.active);
            default:
               return data2.clinic.id - data1.clinic.id;
         }
      });

      setSortedClinics(filter(aux));
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, clinics, search]);

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
               href={SORoutes.management_clinics_create}
               className="flex items-center justify-center gap-2 !px-10 "
            >
               <AddRounded />
               Crear clínica
            </Button>
         </div>
         <ClinicsTable
            directionState={directionState}
            columnState={columnState}
            clinics={sortedClinics
               .slice(page * limit, page * limit + limit)
               .filter(({ clinic }) => !clinic.removed)}
            setClinics={setClinics}
         />
         <div className="h-full" />
         <Pagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(sortedClinics.length / limit)}
         />
      </div>
   );
}
