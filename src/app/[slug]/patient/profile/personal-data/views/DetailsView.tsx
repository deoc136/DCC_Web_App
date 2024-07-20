'use client';

import { User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { useRef, useState } from 'react';
import {
   cutFullName,
   makeNegativeNumberZero,
   translateGenre,
} from '@/lib/utils';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import Button, { Variant } from '@/components/shared/Button';
import CreateIcon from '@mui/icons-material/CreateRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { clinicRoutes } from '@/lib/routes';
import useDictionary from '@/lib/hooks/useDictionary';

interface IDetailsView {
   user: User;
   slug: string;
}

export default function DetailsView({ user, slug }: IDetailsView) {
   const dic = useDictionary();

   const { nationalities, countries, cities, identification_types } =
      useAppSelector(store => store.catalogues);
   const [openChangePassword, setOpenChangePassword] = useState(false);

   const { current: today } = useRef(new Date());

   return (
      <div className="text-sm lg:text-base">
         <PasswordFormModal
            isOpen={openChangePassword}
            setIsOpen={setOpenChangePassword}
         />
         <div className="grid gap-14 sm:grid-cols-[2fr_4fr] lg:grid-cols-1 xl:grid-cols-[1fr_3fr]">
            <div className="mx-10 flex flex-col items-center gap-5">
               <div className="relative aspect-square h-max w-1/2 sm:w-full lg:w-1/3 xl:w-full">
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
               <h2 className="w-full truncate text-center text-base font-semibold lg:text-lg">
                  {cutFullName(user.names, user.last_names)}
               </h2>
               <Button
                  href={clinicRoutes(slug).patient_profile_personal_data_edit}
                  className="flex w-max items-center justify-center gap-2 !px-8 sm:hidden"
               >
                  {dic.texts.flows.edit_profile} <EditRoundedIcon />
               </Button>
            </div>
            <div className="grid h-max gap-10">
               <div className="flex w-full justify-between gap-10">
                  <h3 className="text-lg lg:text-xl">
                     {dic.texts.flows.personal_data}
                  </h3>
                  <Button
                     href={
                        clinicRoutes(slug).patient_profile_personal_data_edit
                     }
                     className="hidden w-max items-center justify-center gap-2 !px-8 sm:flex"
                  >
                     {dic.texts.flows.edit_profile} <EditRoundedIcon />
                  </Button>
               </div>
               <section className="grid gap-5 md:grid-cols-2">
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.name}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.names}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.last_names}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.last_names}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.birth_date}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.birth_date
                           ? (date =>
                                `${date.getDate()}/${
                                   date.getMonth() + 1
                                }/${date.getFullYear()}`)(
                                new Date(user.birth_date),
                             )
                           : dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.age}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.birth_date
                           ? makeNegativeNumberZero(
                                (date =>
                                   today.getFullYear() -
                                   date.getFullYear() -
                                   (today.getMonth() < date.getMonth()
                                      ? 0
                                      : 1))(new Date(user.birth_date)),
                             ) ?? 0
                           : dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.sex}:
                     </p>
                     <p className="break-words text-on-background-text">
                        {user.genre
                           ? translateGenre(user.genre)
                           : dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.nationality}:
                     </p>
                     <p className="break-words text-on-background-text">
                        {nationalities.find(({ id }) => id === user.nationality)
                           ?.display_name ?? dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.identification_type}:
                     </p>
                     <p className="break-words text-on-background-text">
                        {identification_types.find(
                           ({ id }) => id === user.identification_type,
                        )?.display_name ?? dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.identification_number}:
                     </p>
                     <p className="break-words text-on-background-text">
                        {user.identification ?? dic.texts.attributes.empty}
                     </p>
                  </div>
               </section>
               <h3 className="text-lg lg:text-xl">
                  {dic.texts.flows.contact_data}
               </h3>
               <section className="grid gap-5 md:grid-cols-2">
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.email}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.email}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.phone}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {user.phone}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.residence_country}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {countries.find(
                           ({ id }) => id === user.residence_country,
                        )?.display_name ?? dic.texts.attributes.empty}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.residence_city}:
                     </p>
                     <p className="w-full truncate text-on-background-text">
                        {cities.find(({ id }) => id === user.residence_city)
                           ?.display_name ?? 'No registra'}
                     </p>
                  </div>
                  <div className="xl:col-span-2">
                     <p className="mb-2 font-semibold">
                        {dic.texts.users.address}
                     </p>
                     <p className="w-full truncate break-words text-on-background-text">
                        {user.address.length
                           ? user.address
                           : dic.texts.attributes.empty}
                     </p>
                  </div>
               </section>
               <h3 className="text-lg lg:text-xl">
                  {dic.texts.flows.login_and_security}
               </h3>
               <section className="grid items-center gap-2 sm:grid-cols-[2fr_1fr]">
                  <h3 className="text-base font-semibold lg:text-lg">
                     {dic.texts.users.password}
                  </h3>
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setOpenChangePassword(true)}
                     className="ml-auto flex items-center justify-center gap-2"
                  >
                     <CreateIcon />
                     {dic.texts.flows.change_password}
                  </Button>
               </section>
            </div>
         </div>
      </div>
   );
}
