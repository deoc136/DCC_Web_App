'use client';

import Button, { Variant } from '@/components/shared/Button';
import { convertDaysIntoString, cutFullName, translateRole } from '@/lib/utils';
import { FullFilledUser, User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import ServiceOverviewCard from '@/components/shared/cards/ServiceOverviewCard';
import { useEffect, useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import DeactivateUserModal from '@/components/shared/modals/DeactivateUserModal';
import RatingsCard from '@/components/shared/cards/RatingsCard';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import CreateIcon from '@mui/icons-material/CreateRounded';
import { changeTitle } from '@/lib/features/title/title_slice';

interface IDetailsView {
   data: FullFilledUser;
   slug: string;
}

export default function DetailsView({ data, slug }: IDetailsView) {
   const router = useRouter();

   const { user, schedules, services } = data;

   const { hours, week_days } = useAppSelector(store => store.catalogues);
   const [isChanging, setIsChanging] = useState(false);
   const [openChangePassword, setOpenChangePassword] = useState(false);

   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: 'Mi perfil',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className="text-sm lg:text-base">
         <PasswordFormModal
            isOpen={openChangePassword}
            setIsOpen={setOpenChangePassword}
         />
         <DeactivateUserModal
            isOpen={isChanging}
            id={user.id}
            setIsOpen={setIsChanging}
            slug={slug}
         />
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
               <h3 className="my-3 text-base text-on-background-text">
                  {translateRole(user.role)}
               </h3>
               <div className="flex items-center gap-2 bg-foundation p-3">
                  {user.enabled ? (
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
            </div>
            <div className="grid h-max gap-8 lg:gap-10">
               <h3 className="text-lg lg:text-xl">Información general</h3>
               <section className="grid gap-5 border-b border-on-background-disabled pb-8 sm:grid-cols-2 lg:border-none lg:pb-0">
                  <div>
                     <p className="mb-2 font-semibold">Correo electrónico</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.email}
                     </p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Teléfono</p>
                     <p className="w-full truncate text-on-background-text">
                        {user.phone}
                     </p>
                  </div>
                  <div className="sm:col-span-2">
                     <p className="mb-2 font-semibold">
                        Dirección de residencia
                     </p>
                     <p className="break-words text-on-background-text">
                        {user.address.length
                           ? user.address
                           : 'No hay una establecida todavía'}
                     </p>
                  </div>
                  <div className="sm:col-span-2">
                     <p className="mb-2 font-semibold">Jornada laboral</p>
                     <div className="grid grid-cols-2 gap-5">
                        {schedules.map((schedule, i) => (
                           <div key={i} className="text-on-background-text">
                              <p className="mb-2 w-full truncate">
                                 {convertDaysIntoString(
                                    schedule.days.map(({ day }) =>
                                       day.toString(),
                                    ),
                                    week_days,
                                 )}
                              </p>
                              <p className="w-full truncate">
                                 {schedule.hour_ranges
                                    .map(
                                       range =>
                                          `${hours.find(
                                             hour =>
                                                hour.code === range.start_hour,
                                          )?.display_name} - ${hours.find(
                                             hour =>
                                                hour.code === range.end_hour,
                                          )?.display_name}`,
                                    )
                                    .join(' / ')}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
               <h3 className="order-last text-lg lg:order-none lg:text-xl">
                  Ingreso y seguridad
               </h3>
               <section className="order-last grid grid-cols-[2fr_1fr] items-center gap-5 lg:order-none">
                  <h3 className="text-base font-semibold lg:text-lg">
                     Contraseña de ingreso
                  </h3>
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setOpenChangePassword(true)}
                     className="ml-auto flex items-center justify-center gap-2"
                  >
                     <CreateIcon />
                     Cambiar{' '}
                     <span className="hidden md:inline">contraseña</span>
                  </Button>
               </section>
               <h3 className="text-lg lg:text-xl">Servicios asociados</h3>
               <section className="grid gap-5 border-b border-on-background-disabled pb-8 lg:border-none lg:pb-0">
                  {services.map(
                     ({ service }) =>
                        service.active && (
                           <ServiceOverviewCard
                              key={service.id}
                              service={service}
                           />
                        ),
                  )}
               </section>
               <h3 className="text-lg lg:text-xl">Calificaciones</h3>
               <section className="border-b border-on-background-disabled pb-8 sm:grid-cols-2 lg:border-none lg:pb-0">
                  <RatingsCard {...data.rating} />
               </section>
            </div>
         </div>
      </div>
   );
}
