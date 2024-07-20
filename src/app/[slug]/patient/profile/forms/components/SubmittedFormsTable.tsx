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
import { downloadURI } from '@/lib/utils';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import useDictionary from '@/lib/hooks/useDictionary';

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
   const dic = useDictionary();

   const { slug } = useAppSelector(store => store.clinic);

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
               {dic.components.forms_table.columns.form_name}
            </Column>
            <Column allowsSorting key="state">
               {dic.texts.attributes.state}
            </Column>
            <Column key="download">{true}</Column>
         </TableHeader>
         <TableBody>
            {forms.map(form => {
               const submittedForm = submittedForms.find(
                  ({ form_id }) => form_id === form.id,
               );

               return (
                  <Row key={form.id}>
                     <Cell>
                        <div className="max-w-xs truncate">
                           {form.public_name}
                        </div>
                     </Cell>
                     <Cell>
                        {!!submittedForm ? (
                           <div className="flex items-center gap-2 font-semibold text-success">
                              <CheckCircleRoundedIcon />
                              {dic.texts.flows.completed}
                           </div>
                        ) : (
                           <div className="flex items-center gap-2 font-semibold text-on-background-text">
                              <AccessTimeRoundedIcon />
                              {dic.texts.appointments.pending}
                           </div>
                        )}
                     </Cell>
                     <Cell>
                        <div className="flex w-full flex-col items-center justify-end gap-8 md:flex-row">
                           <div
                              className={`grid w-full ${
                                 submittedForm &&
                                 'gap-x-8 gap-y-4 xl:grid-cols-2'
                              }`}
                           >
                              {submittedForm && (
                                 <Button
                                    onPress={() =>
                                       downloadURI(
                                          submittedForm.url,
                                          submittedForm.file_name,
                                       )
                                    }
                                    variant={Variant.outlined}
                                    className="!w-full truncate !border-none !p-0 font-normal"
                                 >
                                    {dic.texts.flows.see_uploaded_file}
                                 </Button>
                              )}
                              <Button
                                 className={`box-border w-full truncate ${
                                    !submittedForm && '!w-max justify-self-end'
                                 }`}
                                 href={
                                    clinicRoutes(slug).patient_profile_forms_id(
                                       form.id,
                                    ).submit
                                 }
                                 variant={
                                    submittedForm
                                       ? Variant.outlined
                                       : Variant.secondary
                                 }
                              >
                                 {submittedForm
                                    ? dic.components.upload_file_input
                                         .replace_file
                                    : dic.texts.flows.fill_form}
                              </Button>
                           </div>
                           <Button
                              onPress={() =>
                                 downloadURI(form.url, form.file_name)
                              }
                              className="w-max bg-transparent !p-0"
                           >
                              <DownloadRoundedIcon className="!fill-on-background-text" />
                           </Button>
                        </div>
                     </Cell>
                  </Row>
               );
            })}
         </TableBody>
      </Table>
   );
}
