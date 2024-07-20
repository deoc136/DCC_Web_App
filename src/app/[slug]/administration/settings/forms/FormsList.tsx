'use client';

import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Table from '@/components/table/Table';
import {
   Cell,
   Column,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import { Dispatch, Key, SetStateAction, useEffect, useState } from 'react';
import NewFormModal from './components/NewFormModal';
import { downloadURI } from '@/lib/utils';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { deleteFormById } from '@/services/forms';

interface IFormsList {
   slug: string;
   forms: IFile[];
}

export default function FormsList({ slug, forms }: IFormsList) {
   const [creatingFormOpen, setCreatingFormOpen] = useState(false);

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();

   const [sortedForms, setSortedForms] = useState(forms);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...forms];

      const typedColumn = column as keyof IFile;

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (typedColumn) {
            case 'public_name':
               return first.public_name.localeCompare(sec.public_name);
            default:
               return data2.id - data1.id;
         }
      });

      setSortedForms(aux);
   }

   useEffect(() => {
      sort(directionState[0], columnState[0]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [...directionState, ...columnState, forms]);

   return (
      <>
         <NewFormModal
            isOpen={creatingFormOpen}
            setIsOpen={setCreatingFormOpen}
            slug={slug}
         />
         <section className="grid grid-cols-2 gap-10">
            <h3 className="text-xl">Mis formularios</h3>
            <Button
               onPress={() => setCreatingFormOpen(true)}
               className="flex h-max !w-max items-center gap-2 justify-self-end !px-14"
            >
               <AddRoundedIcon className="!fill-white" />
               Añadir nuevo formulario
            </Button>
         </section>
         <section className="mt-10 grid gap-5 overflow-auto px-24">
            <p className="text-on-background-text">
               Sube los formularios que tus clientes necesiten para poder
               acceder a sus servicios
            </p>
            <FormsTable
               forms={sortedForms}
               slug={slug}
               columnState={columnState}
               directionState={directionState}
            />
         </section>
      </>
   );
}

interface IFormsTable {
   forms: IFile[];
   slug: string;
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

function FormsTable({ forms, slug, columnState, directionState }: IFormsTable) {
   const router = useRouter();
   const [deletingId, setDeletingId] = useState<number>();

   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;

   useEffect(() => {
      setDeletingId(undefined);
   }, [forms]);

   return (
      <Table
         className="w-full overflow-hidden"
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
            <Column allowsSorting key="public_name">
               Nombre del servicio
            </Column>
            <Column key="download">{true}</Column>
            <Column key="file_name">{true}</Column>
            <Column key="delete">{true}</Column>
         </TableHeader>
         <TableBody>
            {forms.map(form => (
               <Row key={form.id}>
                  <Cell>
                     <div className="max-w-xs truncate">{form.public_name}</div>
                  </Cell>
                  <Cell>
                     <Button
                        onPress={() => downloadURI(form.url, form.file_name)}
                        variant={Variant.outlined}
                        className="flex items-center justify-center gap-2"
                     >
                        <DownloadRoundedIcon />
                        Descargar
                     </Button>
                  </Cell>
                  <Cell>
                     <div className="max-w-xs truncate">{form.file_name}</div>
                  </Cell>
                  <Cell>
                     <Button
                        isDisabled={deletingId === form.id}
                        onPress={async () => {
                           setDeletingId(form.id);
                           await deleteFormById(form.id, slug);
                           router.refresh();
                        }}
                        className="!w-max !bg-transparent !p-0"
                     >
                        <DeleteRoundedIcon className="!fill-secondary" />
                     </Button>
                  </Cell>
               </Row>
            ))}
         </TableBody>
      </Table>
   );
}
