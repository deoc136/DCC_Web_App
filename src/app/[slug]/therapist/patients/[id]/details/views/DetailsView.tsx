'use client';

import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { Key, useEffect, useRef, useState } from 'react';
import {
   cutFullName,
   makeNegativeNumberZero,
   translateGenre,
} from '@/lib/utils';
import { SortDirection } from 'react-stately';
import SubmittedFormsTable from '@/components/shared/tables/SubmittedFormsTable';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { changeTitle } from '@/lib/features/title/title_slice';
import FormCard from '@/components/shared/cards/FormCard';

interface IDetailsView {
   forms: IFile[];
   submittedForms: SubmittedFile[];
   user: User;
   slug: string;
}

export default function DetailsView({
   user,
   forms,
   submittedForms,
   slug,
}: IDetailsView) {
   const router = useRouter();
   const dispatch = useAppDispatch();

   const { nationalities, countries, cities } = useAppSelector(
      store => store.catalogues,
   );

   const { hide_for_therapist } = useAppSelector(store => store.clinic);

   const { current: today } = useRef(new Date());

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

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(slug).therapist_patients,
            value: 'Pacientes / Detalles del paciente',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <>
         <div className="my-5 grid gap-8 lg:my-12 lg:grid-cols-[1fr_3fr] lg:gap-14">
            <div className="flex flex-col items-center border-b border-on-background-disabled pb-8 lg:border-none lg:pb-0 xl:mx-10">
               <div className="relative mb-10 aspect-square w-2/5 lg:w-full">
                  <Image
                     src={
                        user.profile_picture.length
                           ? user.profile_picture
                           : '/default_profile_picture.svg'
                     }
                     className="rounded-full object-cover object-center"
                     alt="user image"
                     fill
                  />
               </div>
               <h2 className="text-base font-semibold lg:text-lg">
                  {cutFullName(user.names, user.last_names)}
               </h2>
            </div>
            <div className="grid h-max gap-8 lg:gap-10">
               <h3 className="text-lg lg:text-xl">Datos del paciente</h3>
               <section className="grid gap-5 border-b border-on-background-disabled pb-8 sm:grid-cols-2 lg:mx-10 lg:border-none lg:pb-0">
                  <div>
                     <p className="mb-2 font-semibold">Nombres:</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.names}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Apellidos:</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.last_names}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Fecha de nacimiento:</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.birth_date
                           ? (date =>
                                `${date.getDate()}/${
                                   date.getMonth() + 1
                                }/${date.getFullYear()}`)(
                                new Date(user.birth_date),
                             )
                           : 'No registra'}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Edad:</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.birth_date
                           ? makeNegativeNumberZero(
                                (date =>
                                   today.getFullYear() -
                                   date.getFullYear() +
                                   (today.getMonth() > date.getMonth()
                                      ? 1
                                      : 0))(new Date(user.birth_date)),
                             )
                           : 'No registra'}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Sexo:</p>
                     <p className="break-words text-on-background-text">
                        {user.genre
                           ? translateGenre(user.genre)
                           : 'No registra'}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Nacionalidad:</p>
                     <p className="break-words text-on-background-text">
                        {nationalities.find(({ id }) => id === user.nationality)
                           ?.display_name ?? 'No registra'}
                     </p>
                  </div>
               </section>
               {!hide_for_therapist && (
                  <>
                     <h3 className="text-lg lg:text-xl">Datos de contacto</h3>
                     <section className="grid gap-5 border-b border-on-background-disabled pb-8 sm:grid-cols-2 lg:mx-10 lg:border-none lg:pb-0">
                        <div>
                           <p className="mb-2 font-semibold">
                              Correo electrónico:
                           </p>
                           <p className="w-full truncate text-on-background-text">
                              {user.email}
                           </p>
                        </div>
                        <div>
                           <p className="mb-2 font-semibold">Teléfono:</p>
                           <p className="w-full truncate text-on-background-text">
                              {user.phone}
                           </p>
                        </div>
                        <div className="sm:col-span-2">
                           <p className="mb-2 font-semibold">
                              Dirección de residencia:
                           </p>
                           <p className="break-words text-on-background-text">
                              {user.address.length
                                 ? user.address
                                 : 'No hay una establecida todavía'}
                           </p>
                        </div>
                        <div>
                           <p className="mb-2 font-semibold">
                              País de residencia:
                           </p>
                           <p className="w-full truncate text-on-background-text">
                              {countries.find(
                                 ({ id }) => id === user.residence_country,
                              )?.display_name ?? 'No registra'}
                           </p>
                        </div>
                        <div>
                           <p className="mb-2 font-semibold">
                              Ciudad y región de residencia:
                           </p>
                           <p className="w-full truncate text-on-background-text">
                              {cities.find(
                                 ({ id }) => id === user.residence_city,
                              )?.display_name ?? 'No registra'}
                           </p>
                        </div>
                     </section>
                  </>
               )}
               <h3 className="text-lg lg:text-xl">Documentos adjuntos</h3>
               <section className="grid gap-5 border-b border-on-background-disabled pb-8 lg:mx-10 lg:border-none lg:pb-0">
                  <div className="hidden lg:block">
                     <SubmittedFormsTable
                        columnState={columnState}
                        directionState={directionState}
                        forms={sortedForms}
                        submittedForms={submittedForms}
                     />
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 lg:hidden">
                     {forms.map(form => (
                        <FormCard
                           key={form.id}
                           submittedForm={submittedForms.find(
                              ({ form_id }) => form_id === form.id,
                           )}
                           form={form}
                        />
                     ))}
                  </div>
               </section>
               <section className="flex flex-col justify-between gap-5 sm:flex-row">
                  <h3 className="text-lg lg:text-xl">Historia clínica</h3>
                  <Button
                     variant={Variant.secondary}
                     className="flex flex-none items-center justify-center gap-2 sm:!w-max sm:!px-10"
                     href={
                        clinicRoutes(slug).therapist_patients_id(user.id)
                           .details_history
                     }
                  >
                     Abrir historia clínica <ArrowForwardRoundedIcon />
                  </Button>
               </section>
            </div>
         </div>
      </>
   );
}
