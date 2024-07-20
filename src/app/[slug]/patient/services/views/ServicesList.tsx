'use client';

import { Service } from '@/types/service';
import ServiceCard from '../../components/ServiceCard';
import { useEffect, useRef, useState } from 'react';
import { secondsToTimeExtended } from '@/lib/utils';
import Pagination from '@/components/shared/Pagination';
import TextField from '@/components/inputs/TextField';
import { Search } from '@mui/icons-material';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { createPortal } from 'react-dom';
import { changeTitle } from '@/lib/features/title/title_slice';
import useDictionary from '@/lib/hooks/useDictionary';

interface IServicesList {
   services: Service[];
}

export default function ServicesList({ services }: IServicesList) {
   const dic = useDictionary();

   const [search, setSearch] = useState('');

   const dispatch = useAppDispatch();

   const [page, setPage] = useState(0);
   const limit = 12;

   const [patientNavbar, setPatientNavbar] = useState<Element | null>(null);

   function filter($services: Service[]) {
      return $services.filter(el =>
         search.length
            ? [
                 el.price,
                 secondsToTimeExtended(Number(el.service_duration)),
                 el.name,
              ].some(att => att.toLowerCase().includes(search.toLowerCase()))
            : true,
      );
   }

   useEffect(() => {
      setPage(0);
   }, [search, services.length]);

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: '',
         }),
      );
   }, [dispatch]);

   useEffect(() => {
      setPatientNavbar(document.querySelector('#patient-navbar') ?? null);
   }, []);

   return (
      <>
         {patientNavbar &&
            createPortal(
               <>
                  <h1 className="mb-3 text-xl font-semibold lg:mb-5 lg:text-2xl">
                     {dic.pages.patient.services.title}
                  </h1>
                  <TextField
                     aria-label="search"
                     value={search}
                     onChange={setSearch}
                     startIcon={<Search className="text-base lg:text-xl" />}
                     className="w-full text-xs lg:text-base"
                     placeholder={dic.texts.flows.search}
                  />
               </>,
               patientNavbar,
            )}
         <section className="grid min-h-full grid-rows-[1fr_auto] gap-10 xl:px-24">
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
               {filter(services)
                  .slice(page * limit, page * limit + limit)
                  .map(service => (
                     <ServiceCard key={service.id} service={service} />
                  ))}
            </div>
            <Pagination
               page={page}
               setPage={setPage}
               totalPages={Math.ceil(services.length / limit)}
            />
         </section>
      </>
   );
}
