import Table from '@/components/table/Table';
import { Dispatch, Key, SetStateAction } from 'react';
import {
   Cell,
   Column,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import Button, { Variant } from '../Button';
import { downloadURI } from '@/lib/utils';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

interface ISubmittedFormsTable {
   forms: IFile[];
   submittedForms: SubmittedFile[];
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function SubmittedFormsTable({
   forms,
   submittedForms,
   columnState,
   directionState,
}: ISubmittedFormsTable) {
   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;

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
               Nombre del formulario
            </Column>
            <Column allowsSorting key="state">
               Estado
            </Column>
            <Column key="download">{true}</Column>
         </TableHeader>
         <TableBody>
            {forms.map(form => (
               <Row key={form.id}>
                  <Cell>
                     <div className="max-w-xs truncate">{form.public_name}</div>
                  </Cell>
                  <Cell>
                     {submittedForms.some(
                        ({ form_id }) => form_id === form.id,
                     ) ? (
                        <div className="font-semibold text-success">
                           Completado <CheckCircleRoundedIcon />
                        </div>
                     ) : (
                        <div className="font-semibold text-error">
                           Por completar <CancelRoundedIcon />
                        </div>
                     )}
                  </Cell>
                  <Cell>
                     {(file => {
                        return file ? (
                           <Button
                              onPress={() =>
                                 downloadURI(file.url, file.file_name)
                              }
                              variant={Variant.outlined}
                              className="flex items-center justify-center gap-2"
                           >
                              <DownloadRoundedIcon />
                              Descargar
                           </Button>
                        ) : (
                           <Button
                              variant={Variant.secondary}
                              isDisabled
                              className="flex items-center justify-center gap-2"
                           >
                              Descargar
                           </Button>
                        );
                     })(
                        submittedForms.find(
                           ({ form_id }) => form_id === form.id,
                        ),
                     )}
                  </Cell>
               </Row>
            ))}
         </TableBody>
      </Table>
   );
}
