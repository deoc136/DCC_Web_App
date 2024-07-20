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
import { Clinic, ClinicPopulated } from '@/types/clinic';
import { editClinic, getAllClinicsPopulated } from '@/services/clinic';
import { SORoutes } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import DeactivationModal from '@/components/shared/modals/DeactivationModal';
import DeletingModal from '@/components/shared/modals/DeletingModal';
import ActivationModal from '@/components/shared/modals/ActivationModal';

interface IClinicsTable {
   clinics: ClinicPopulated[];
   setClinics: Dispatch<SetStateAction<ClinicPopulated[]>>;
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function ClinicsTable({
   clinics,
   setClinics,
   directionState,
   columnState,
}: IClinicsTable) {
   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;
   const [deletingId, setDeletingId] = useState<number>();

   const [isDeleting, setIsDeleting] = useState(false);
   const [isChanging, setIsChanging] = useState(false);

   const [deactivatingId, setDeactivatingId] = useState<number>();
   const [activatingId, setActivatingId] = useState<number>();

   const activating = useRef(false);

   async function activate() {
      if (isChanging || !activatingId) return;

      setIsChanging(true);

      try {
         await editClinic({
            ...clinics.find(({ clinic }) => clinic.id === activatingId)!.clinic,
            active: true,
         });

         setClinics((await getAllClinicsPopulated()).data);
      } catch (error) {}

      setActivatingId(undefined);
      setIsChanging(false);
   }

   async function deactivate() {
      if (isChanging || !deactivatingId) return;

      setIsChanging(true);

      try {
         await editClinic({
            ...clinics.find(({ clinic }) => clinic.id === deactivatingId)!
               .clinic,
            active: false,
         });

         setClinics((await getAllClinicsPopulated()).data);
      } catch (error) {}

      setDeactivatingId(undefined);
      setIsChanging(false);
   }

   async function deleteRow() {
      if (isDeleting || !deletingId) return;

      setIsDeleting(true);

      try {
         await editClinic({
            ...clinics.find(({ clinic }) => clinic.id === deletingId)!.clinic,
            removed: true,
         });

         setClinics((await getAllClinicsPopulated()).data);
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
               ¿Deseas activar esta clínica de nuevo?
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
                  ¿Deseas desactivar esta clínica?
               </h3>
               <p className="text-center  !font-normal text-on-background-text body-1">
                  No podrá ser accedida a partir de la fecha de inactivación.
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
                  ¿Deseas eliminar esta clínica del sistema?
               </h3>
               <p className="text-center  !font-normal text-on-background-text body-1">
                  Una vez eliminada no podrás recuperar los datos de esta
                  clínica
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
                  Nombre de la Clínica
               </Column>
               <Column allowsSorting key="country">
                  País
               </Column>
               <Column allowsSorting key="identification_id">
                  Tipo de Identificación
               </Column>
               <Column allowsSorting key="identification">
                  Número de ID
               </Column>
               <Column allowsSorting key="active">
                  <span className="w-full text-center">Estado</span>
               </Column>
               <Column key="details">{true}</Column>
               <Column key="option">{true}</Column>
            </TableHeader>
            <TableBody>
               {clinics.map(({ clinic, country, identification_type }) => (
                  <Row key={clinic.id}>
                     <Cell>
                        <span
                           className={`${
                              !clinic.active && 'text-on-background-disabled'
                           }`}
                        >
                           {clinic.name}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !clinic.active && 'text-on-background-disabled'
                           }`}
                        >
                           {country.name}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !clinic.active && 'text-on-background-disabled'
                           }`}
                        >
                           {identification_type.name}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !clinic.active && 'text-on-background-disabled'
                           }`}
                        >
                           {clinic.identification}
                        </span>
                     </Cell>
                     <Cell>
                        <Button
                           onPress={() =>
                              clinic.active
                                 ? setDeactivatingId(clinic.id)
                                 : setActivatingId(clinic.id)
                           }
                           className={`flex justify-end gap-2 bg-transparent !p-0 font-normal !text-black ${
                              !clinic.active && '!text-on-background-disabled'
                           }`}
                        >
                           {deactivatingId === clinic.id ? (
                              <>Cargando...</>
                           ) : clinic.active ? (
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
                              SORoutes.management_clinic_slug(clinic.slug)
                                 .details
                           }
                        >
                           Ver detalles
                        </Link>
                     </Cell>
                     <Cell>
                        <SeeMoreButton
                           slug={clinic.slug}
                           deleteRow={setDeletingId}
                           deletingId={deletingId}
                           id={clinic.id}
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
   slug,
   deletingId,
   deleteRow,
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
                  <Link href={SORoutes.management_clinic_slug(slug).edit}>
                     <div className="w-full py-3 pl-8">Editar</div>
                  </Link>
               </Item>
               <Item textValue="Eliminar">
                  <Button
                     isDisabled={deletingId === id}
                     onPress={() => {
                        deleteRow(id);
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-secondary"
                  >
                     {deletingId === id ? 'Eliminando' : 'Eliminar'}
                  </Button>
               </Item>
            </ListBox>
         </Dialog>
      </PopoverTrigger>
   );
}
