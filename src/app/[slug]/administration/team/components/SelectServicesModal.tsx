'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, Key, SetStateAction, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Service } from '@/types/service';
import Table from '@/components/table/Table';
import {
   Cell,
   Column,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { formatPrice, secondsToTime } from '@/lib/utils';
import Link from 'next/link';
import { clinicRoutes } from '@/lib/routes';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import Pagination from '@/components/shared/Pagination';
import TextField from '@/components/inputs/TextField';
import { Search } from '@mui/icons-material';

interface ISelectServicesModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   services: Service[];
   baseSelectedServices: Key[];
   setBaseSelectedServices: Dispatch<SetStateAction<Key[]>>;
}

export default function SelectServicesModal({
   isOpen,
   setIsOpen,
   services,
   baseSelectedServices,
   setBaseSelectedServices,
}: ISelectServicesModal) {
   const clinicCurrency = useClinicCurrency();

   const { slug } = useAppSelector(store => store.clinic);

   const [search, setSearch] = useState('');
   const [sortedServices, setSortedServices] = useState(filter(services));

   const [selectedServices, setSelectedServices] =
      useState(baseSelectedServices);

   const [direction, setDirection] = useState<SortDirection>('ascending');
   const [column, setColumn] = useState<Key>();

   const [page, setPage] = useState(0);
   const limit = 6;

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
   function sort(direction: string, column: Key | undefined) {
      const aux = [...services];

      const typedColumn = column as keyof Service | undefined;

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
      sort(direction, column);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [direction, column, services, search]);

   useEffect(() => {
      setPage(0);
   }, [search, services.length]);

   useEffect(() => {
      setSelectedServices(baseSelectedServices);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen]);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col gap-6 rounded-xl p-7 ">
               <div className="flex min-w-[40vw] items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                     Añadir servicios asociados
                  </h2>
                  <Button
                     className="!w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <TextField
                  aria-label="search"
                  value={search}
                  onChange={setSearch}
                  startIcon={<Search />}
                  className="w-full"
                  placeholder="Buscar"
               />
               <Table
                  onSelectionChange={selection => {
                     setSelectedServices(Array.from(selection));
                  }}
                  selectedKeys={selectedServices}
                  className="w-full"
                  selectionMode="multiple"
                  onSortChange={desc => {
                     setDirection(prev =>
                        prev === 'ascending' ? 'descending' : 'ascending',
                     );
                     setColumn(desc.column);
                  }}
                  sortDescriptor={{ column, direction }}
               >
                  <TableHeader>
                     <Column allowsSorting key="name">
                        Nombre del servicio
                     </Column>
                     <Column allowsSorting key="price">
                        Precio
                     </Column>
                     <Column allowsSorting key="service_duration">
                        Duración
                     </Column>
                     <Column key="active">
                        <span className="w-full text-center">Estado</span>
                     </Column>
                     <Column key="details">{true}</Column>
                  </TableHeader>
                  <TableBody>
                     {sortedServices
                        .slice(page * limit, page * limit + limit)
                        .map(service => (
                           <Row key={service.id}>
                              <Cell>
                                 <span
                                    className={`${
                                       !service.active &&
                                       'text-on-background-disabled'
                                    }`}
                                 >
                                    {service.name}
                                 </span>
                              </Cell>
                              <Cell>
                                 <span
                                    className={`${
                                       !service.active &&
                                       'text-on-background-disabled'
                                    }`}
                                 >
                                    {formatPrice(
                                       Number(service.price),
                                       clinicCurrency,
                                    )}
                                 </span>
                              </Cell>
                              <Cell>
                                 <span
                                    className={`${
                                       !service.active &&
                                       'text-on-background-disabled'
                                    }`}
                                 >
                                    {secondsToTime(
                                       Number(service.service_duration),
                                    )}
                                 </span>
                              </Cell>
                              <Cell>
                                 <div className="flex items-center gap-2">
                                    {service.active ? (
                                       <>
                                          <CircleRoundedIcon className="!fill-success" />
                                          Activo
                                       </>
                                    ) : (
                                       <>
                                          <CircleOutlinedRoundedIcon />
                                          Inactivo
                                       </>
                                    )}
                                 </div>
                              </Cell>
                              <Cell>
                                 <Link
                                    target="_blank"
                                    className="text-secondary underline underline-offset-2"
                                    href={
                                       clinicRoutes(slug).admin_services_id(
                                          service.id,
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
               <Pagination
                  page={page}
                  setPage={setPage}
                  totalPages={Math.ceil(services.length / limit)}
               />
               <div className="flex gap-5">
                  <Button
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button
                     onPress={() => {
                        setBaseSelectedServices(selectedServices);
                        setIsOpen(false);
                     }}
                  >
                     Añadir
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
