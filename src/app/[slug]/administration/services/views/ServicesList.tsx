'use client';

import TextField from '@/components/inputs/TextField';
import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { AddRounded, Search } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import Pagination from '@/components/shared/Pagination';
import { Service } from '@/types/service';
import ServicesTable from '../components/ServicesTable';
import { secondsToTime } from '@/lib/utils';

interface IServicesList {
   baseServices: Service[];
   slug: string;
}

type ServiceKey = keyof Service;

export default function ServicesList({ baseServices, slug }: IServicesList) {
   const router = useRouter();

   const dispatch = useAppDispatch();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [search, setSearch] = useState('');
   const [services, setServices] = useState(baseServices);

   const [page, setPage] = useState(0);
   const limit = 7;

   function filter($services: Service[]) {
      return $services.filter(el =>
         search.length
            ? [
                 el.price,
                 secondsToTime(Number(el.service_duration)),
                 el.name,
              ].some(att => att.toLowerCase().includes(search.toLowerCase()))
            : true,
      );
   }

   const [sortedServices, setSortedServices] = useState(filter(services));

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Servicios',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      setPage(0);
   }, [search, services.length]);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...services];

      const typedColumn = column as ServiceKey | undefined;

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (typedColumn) {
            case 'name':
               return first.name.localeCompare(sec.name);
            case 'price':
               return Number(first.price) - Number(sec.price);
            case 'service_duration':
               return (
                  Number(first.service_duration) - Number(sec.service_duration)
               );
            case 'active':
               return Number(first.active) - Number(sec.active);
            default:
               return data2.id - data1.id;
         }
      });

      setSortedServices(filter(aux));
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, services, search]);

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
               href={clinicRoutes(slug).admin_services_create}
               className="flex items-center justify-center gap-2 !px-10 "
            >
               <AddRounded />
               Crear servicio
            </Button>
         </div>
         <ServicesTable
            directionState={directionState}
            columnState={columnState}
            services={sortedServices
               .slice(page * limit, page * limit + limit)
               .filter(service => !service.removed)}
            setServices={setServices}
         />
         <div className="h-full" />
         <Pagination
            page={page}
            setPage={setPage}
            totalPages={Math.ceil(sortedServices.length / limit)}
         />
      </div>
   );
}
