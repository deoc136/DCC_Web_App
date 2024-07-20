'use client';

import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { convertDaysIntoString, cutFullName, translateRole } from '@/lib/utils';
import { FullFilledUser, User } from '@/types/user';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ServiceOverviewCard from '@/components/shared/cards/ServiceOverviewCard';
import { useState } from 'react';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import DeactivateUserModal from '@/components/shared/modals/DeactivateUserModal';
import RatingsCard from '@/components/shared/cards/RatingsCard';

interface IDetailsView {
   data: FullFilledUser;
   slug: string;
}

export default function DetailsView({ data, slug }: IDetailsView) {
   const router = useRouter();

   const { user, schedules, services } = data;

   const { hours, week_days } = useAppSelector(store => store.catalogues);
   const [isChanging, setIsChanging] = useState(false);

   return (
      <>
         <DeactivateUserModal
            isOpen={isChanging}
            id={user.id}
            setIsOpen={setIsChanging}
            slug={slug}
         />
         <div className="my-12 grid grid-cols-[1fr_3fr] gap-14">
            <div className="mx-10 flex flex-col items-center">
               <div className="relative mb-10 aspect-square w-full">
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
               <h2 className="text-lg font-semibold">
                  {cutFullName(user.names, user.last_names)}
               </h2>
               <h3 className="my-3 text-base text-on-background-text">
                  {translateRole(user.role)}
               </h3>
               <Button
                  variant={Variant.secondary}
                  className={`flex w-max justify-end gap-2 rounded-md !bg-foundation p-3 font-normal !text-black ${
                     !data.user.enabled && '!text-on-background-disabled'
                  }`}
                  onPress={() => setIsChanging(true)}
               >
                  {isChanging ? (
                     'Cambiando...'
                  ) : data.user.enabled ? (
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
            </div>
            <div className="grid h-max gap-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl">Información general</h3>
                  <Button
                     href={clinicRoutes(slug).admin_team_id(user.id).edit}
                     className="flex h-max !w-max items-center gap-2 justify-self-end !px-14"
                  >
                     <EditRoundedIcon className="!fill-white" /> Editar
                  </Button>
               </div>
               <section className="grid grid-cols-2 gap-5">
                  <div>
                     <p className="mb-2 font-semibold">Correo electrónico</p>
                     <p className="text-on-background-text">{user.email}</p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Número de Teléfono</p>
                     <p className="text-on-background-text">{user.phone}</p>
                  </div>
                  <div className="col-span-2">
                     <p className="mb-2 font-semibold">
                        Dirección de residencia
                     </p>
                     <p className="break-words text-on-background-text">
                        {user.address.length
                           ? user.address
                           : 'No hay una establecida todavía'}
                     </p>
                  </div>
                  <div className="col-span-2">
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
               <h3 className="text-xl">Servicios asociados</h3>
               <section className="grid gap-5">
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
               <h3 className="text-xl">Calificaciones</h3>
               <section>
                  <RatingsCard {...data.rating} />
               </section>
            </div>
         </div>
      </>
   );
}
