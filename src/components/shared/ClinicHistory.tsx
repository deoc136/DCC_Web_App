'use client';

import Button from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { cutFullName, translateRole } from '@/lib/utils';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface IClinicHistory {
   history: ClinicHistory;
   service?: Service;
   therapist?: User;
   expanded?: boolean;
   printing?: boolean;
}

export default function ClinicHistory({
   history,
   service,
   therapist,
   expanded = false,
   printing,
}: IClinicHistory) {
   const { hours } = useAppSelector(store => store.catalogues);
   const user = useAppSelector(store => store.user);

   const { slug } = useAppSelector(store => store.clinic);

   const [isOpen, setIsOpen] = useState(expanded);

   const maxLength = 200;

   useEffect(() => {
      setIsOpen(expanded);
   }, [expanded]);

   return (
      <>
         <article className="grid gap-5 text-on-background-text md:grid-cols-[auto_1fr]">
            <div className="hidden h-min gap-4 md:grid">
               <p>
                  {(date =>
                     `${date.getDate()}/${
                        date.getMonth() + 1
                     }/${date.getFullYear()}`)(new Date(history.date))}
               </p>
               <p>
                  {
                     hours.find(hour => hour.code === history.hour.toString())
                        ?.display_name
                  }
               </p>
            </div>
            <div className="grid gap-3">
               <h3 className="text-sm font-semibold text-black lg:text-base">
                  {service ? (
                     <Link
                        href={
                           user?.role === 'ADMINISTRATOR'
                              ? clinicRoutes(slug).admin_services_id(service.id)
                                   .details
                              : '#'
                        }
                     >
                        {service.name}
                     </Link>
                  ) : (
                     'No registra'
                  )}
               </h3>
               <p className="font-semibold">
                  {therapist ? (
                     <Link
                        href={
                           user?.role === 'ADMINISTRATOR'
                              ? clinicRoutes(slug).admin_team_id(therapist.id)
                                   .details
                              : '#'
                        }
                     >
                        {cutFullName(therapist.names, therapist.last_names)} (
                        {user && translateRole(therapist.role)})
                     </Link>
                  ) : (
                     'No registra'
                  )}
               </p>
               <div className="flex h-min gap-4 md:hidden">
                  <p>
                     {(date =>
                        `${date.getDate()}/${
                           date.getMonth() + 1
                        }/${date.getFullYear()}`)(new Date(history.date))}
                  </p>
                  <p>
                     {
                        hours.find(
                           hour => hour.code === history.hour.toString(),
                        )?.display_name
                     }
                  </p>
               </div>
               <div
                  className={`border-on-background-disabled ${
                     !printing && 'border-b'
                  }`}
               />
               <p className={`w-full break-all ${expanded && 'text-justify'}`}>
                  {history.content.length <= maxLength
                     ? history.content
                     : isOpen
                     ? history.content
                     : `${history.content.slice(0, maxLength).trim()}...`}
               </p>
               {history.content.length > maxLength && !expanded && (
                  <Button
                     className="!w-max bg-transparent !p-0 !text-secondary underline"
                     onPress={() => setIsOpen(prev => !prev)}
                  >
                     {isOpen ? 'Ver menos' : 'Ver más'}
                  </Button>
               )}
            </div>
            <div className="relative scale-x-105 border-b border-on-background-disabled md:hidden" />
         </article>
      </>
   );
}
