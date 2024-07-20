'use client';

import Dialog from '@/components/modal/Dialog';
import { ListBox } from '@/components/shared/ListBox';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import Table from '@/components/table/Table';
import {
   Cell,
   Column,
   Item,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import Link from 'next/link';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Dispatch, Key, SetStateAction, useRef, useState } from 'react';
import Button from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import { Service } from '@/types/service';
import { editService, getAllServices } from '@/services/service';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { formatPrice, secondsToTime } from '@/lib/utils';
import DeletingModal from '@/components/shared/modals/DeletingModal';
import { clinicRoutes } from '@/lib/routes';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import DeactivationModal from '@/components/shared/modals/DeactivationModal';
import ActivationModal from '@/components/shared/modals/ActivationModal';

interface IServicesTable {
   services: Service[];
   setServices: Dispatch<SetStateAction<Service[]>>;
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function ServicesTable({
   services,
   setServices,
   directionState,
   columnState,
}: IServicesTable) {
   const clinicCurrency = useClinicCurrency();

   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;
   const [deletingId, setDeletingId] = useState<number>();

   const [activatingId, setActivatingId] = useState<number>();
   const [deactivatingId, setDeactivatingId] = useState<number>();

   const [isDeleting, setIsDeleting] = useState(false);
   const [isChanging, setIsChanging] = useState(false);

   const { slug } = useAppSelector(store => store.clinic);

   const activating = useRef(false);

   async function activate() {
      if (isChanging || !activatingId) return;

      setIsChanging(true);

      try {
         await editService(
            {
               ...services.find(service => service.id === activatingId)!,
               active: true,
            },
            slug,
         );

         setServices((await getAllServices(slug)).data);
      } catch (error) {}

      setActivatingId(undefined);
      setIsChanging(false);
   }

   async function deactivate() {
      if (isChanging || !deactivatingId) return;

      setIsChanging(true);

      try {
         await editService(
            {
               ...services.find(service => service.id === deactivatingId)!,
               active: false,
            },
            slug,
         );

         setServices((await getAllServices(slug)).data);
      } catch (error) {}

      setDeactivatingId(undefined);
      setIsChanging(false);
   }

   async function deleteRow() {
      if (isDeleting || !deletingId) return;

      setIsDeleting(true);

      try {
         await editService(
            {
               ...services.find(service => service.id === deletingId)!,
               removed: true,
            },
            slug,
         );

         setServices((await getAllServices(slug)).data);
      } catch (error) {}

      setDeletingId(undefined);
      setIsDeleting(false);
   }

   return (
      <>
         <ActivationModal
            isActivating={isChanging}
            dismiss={() => setActivatingId(undefined)}
            isOpen={activatingId !== undefined && !activating.current}
            action={activate}
         >
            <h3 className="mb-3 text-center text-xl">
               ¿Deseas activar este servicio de nuevo?
            </h3>
         </ActivationModal>
         <DeactivationModal
            isDeactivating={isChanging}
            dismiss={() => setDeactivatingId(undefined)}
            isOpen={deactivatingId !== undefined && !activating.current}
            action={deactivate}
         >
            <div>
               <h3 className="mb-3 text-center text-xl">
                  ¿Deseas desactivar este servicio?
               </h3>
               <p className="text-center  !font-normal text-on-background-text body-1">
                  Ni tu equipo ni tu podrán crear nuevas reservas bajo esta
                  modalidad de <br /> servicio a partir de la fecha de
                  inactivación.
               </p>
            </div>
         </DeactivationModal>
         <DeletingModal
            isDeleting={isDeleting}
            dismiss={() => setDeletingId(undefined)}
            isOpen={deletingId !== undefined}
            action={deleteRow}
         >
            <div>
               <h3 className="mb-3 text-center text-xl">
                  ¿Deseas eliminar el servicio del sistema?
               </h3>
               <p className="text-center  !font-normal text-on-background-text body-1">
                  Una vez eliminado no podrás recuperar los datos de este
                  servicio
               </p>
            </div>
         </DeletingModal>
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
               <Column allowsSorting key="name">
                  Nombre del servicio
               </Column>
               <Column allowsSorting key="price">
                  Precio
               </Column>
               <Column allowsSorting key="service_duration">
                  Duración
               </Column>
               <Column allowsSorting key="active">
                  <span className="w-full text-center">Estado</span>
               </Column>
               <Column key="details">{true}</Column>
               <Column key="option">{true}</Column>
            </TableHeader>
            <TableBody>
               {services.map(service => (
                  <Row key={service.id}>
                     <Cell>
                        <span
                           className={`${
                              !service.active && 'text-on-background-disabled'
                           }`}
                        >
                           {service.name}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !service.active && 'text-on-background-disabled'
                           }`}
                        >
                           {formatPrice(Number(service.price), clinicCurrency)}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !service.active && 'text-on-background-disabled'
                           }`}
                        >
                           {secondsToTime(Number(service.service_duration))}
                        </span>
                     </Cell>
                     <Cell>
                        <Button
                           onPress={() =>
                              service.active
                                 ? setDeactivatingId(service.id)
                                 : setActivatingId(service.id)
                           }
                           className={`m-auto flex !w-max gap-2 bg-transparent !p-0 font-normal !text-black ${
                              !service.active && '!text-on-background-disabled'
                           }`}
                        >
                           {activatingId === service.id ? (
                              <>Cargando...</>
                           ) : service.active ? (
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
                           <ArrowDropDownRoundedIcon className="!fill-on-background-text" />
                        </Button>
                     </Cell>
                     <Cell>
                        <Link
                           className="text-secondary underline underline-offset-2"
                           href={
                              clinicRoutes(slug).admin_services_id(service.id)
                                 .details
                           }
                        >
                           Ver detalles
                        </Link>
                     </Cell>
                     <Cell>
                        <SeeMoreButton
                           slug={slug}
                           deleteRow={setDeletingId}
                           deletingId={deletingId}
                           id={service.id}
                        />
                     </Cell>
                  </Row>
               ))}
            </TableBody>
         </Table>
      </>
   );
}

function SeeMoreButton({
   id,
   deleteRow,
   slug,
}: {
   id: number;
   slug: string;
   deletingId: number | undefined;
   deleteRow: Dispatch<SetStateAction<number | undefined>>;
}) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <PopoverTrigger
         isOpen={isOpen}
         onOpenChange={setIsOpen}
         trigger={<MoreVertRoundedIcon className="!fill-on-background-text" />}
      >
         <Dialog className="rounded">
            <ListBox className="right-0 !p-0 !py-2 shadow-xl">
               <Item textValue="Editar">
                  <Link href={clinicRoutes(slug).admin_services_id(id).edit}>
                     <div className="w-full py-3 pl-8">Editar</div>
                  </Link>
               </Item>
               <Item textValue="Eliminar">
                  <Button
                     onPress={() => {
                        deleteRow(id);
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-secondary"
                  >
                     Eliminar
                  </Button>
               </Item>
            </ListBox>
         </Dialog>
      </PopoverTrigger>
   );
}
