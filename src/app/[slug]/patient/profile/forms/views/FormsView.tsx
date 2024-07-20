'use client';

import Button, { Variant } from '@/components/shared/Button';
import Card from '@/components/shared/cards/Card';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { downloadURI } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Key, useEffect, useState } from 'react';
import { SortDirection } from 'react-stately';
import SubmittedFormsTable from '../components/SubmittedFormsTable';
import useDictionary from '@/lib/hooks/useDictionary';

interface IFormsView {
   submittedForms: SubmittedFile[];
   forms: IFile[];
}

export default function FormsView({ forms, submittedForms }: IFormsView) {
   const dic = useDictionary();

   const directionState = useState<SortDirection>('ascending');
   const columnState = useState<Key>();
   const [sortedForms, setSortedForms] = useState(forms);

   function sort(direction: string, column: Key | undefined) {
      const aux = [...forms];

      aux.sort((data1, data2) => {
         const first = direction === 'ascending' ? data1 : data2,
            sec = direction === 'ascending' ? data2 : data1;

         switch (column) {
            case 'public_name':
               return first.public_name.localeCompare(sec.public_name);
            case 'state':
               return (
                  Number(
                     submittedForms.some(form => form.form_id === first.id),
                  ) -
                  Number(submittedForms.some(form => form.form_id === sec.id))
               );

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
      <div className="grid gap-7 text-sm lg:text-base">
         <h2 className="text-lg font-semibold lg:text-xl">
            {dic.texts.flows.my_forms}
         </h2>
         <div className="text-on-background-text">
            <h3 className="mb-5 text-base font-semibold lg:text-lg">
               {dic.pages.patient.profile.my_profile.sub_title}
            </h3>
            <p>{dic.pages.patient.profile.my_profile.description}</p>
         </div>
         <section className="grid gap-7 lg:hidden">
            {forms.map(form => (
               <FormCard
                  key={form.id}
                  submittedForm={submittedForms.find(
                     ({ form_id }) => form_id === form.id,
                  )}
                  form={form}
               />
            ))}
         </section>
         <section className="hidden lg:block">
            <SubmittedFormsTable
               columnState={columnState}
               directionState={directionState}
               forms={sortedForms}
               submittedForms={submittedForms}
            />
         </section>
      </div>
   );
}

interface IFormCard {
   form: IFile;
   submittedForm?: SubmittedFile;
}

function FormCard({ form, submittedForm }: IFormCard) {
   const dic = useDictionary();

   const slug = useAppSelector(store => store.clinic.slug);

   return (
      <Card className="flex flex-col !p-0">
         <div className="flex w-full justify-between bg-foundation p-4">
            <h3 className="text-sm">{form.public_name}</h3>
            <Button
               onPress={() =>
                  submittedForm
                     ? downloadURI(submittedForm.url, submittedForm.file_name)
                     : downloadURI(form.url, form.file_name)
               }
               className="w-max bg-transparent !p-0"
            >
               <DownloadRoundedIcon className="!fill-secondary" />
            </Button>
         </div>
         <div className="flex justify-between p-4 font-semibold">
            <p>{dic.texts.attributes.state}</p>
            {!submittedForm ? (
               <div className="flex items-center gap-2 text-on-background-text">
                  <AccessTimeRoundedIcon /> {dic.texts.appointments.pending}
               </div>
            ) : (
               <div className="flex items-center gap-2 font-semibold text-success">
                  <CheckCircleRoundedIcon /> {dic.texts.flows.completed}
               </div>
            )}
         </div>
         <div className="p-4 pt-0">
            <Button
               href={
                  clinicRoutes(slug).patient_profile_forms_id(form.id).submit
               }
               variant={submittedForm ? Variant.outlined : Variant.secondary}
            >
               {submittedForm
                  ? dic.components.upload_file_input.replace_file
                  : dic.texts.flows.fill_form}
            </Button>
         </div>
      </Card>
   );
}
