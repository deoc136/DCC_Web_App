'use client';

import Button from '@/components/shared/Button';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { usePathname } from 'next/navigation';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string } }>) {
   const pathname = usePathname();

   const dispatch = useAppDispatch();

   const [adminBody, setAdminBody] = useState<Element | null>(null);

   useEffect(() => {
      setAdminBody(document.querySelector('#admin-body header') ?? null);
   }, [dispatch]);

   const options = [
      {
         name: 'Reservas activas',
         route: clinicRoutes(params.slug).admin_appointments_actives,
      },
      {
         name: 'Historial de reservas',
         route: clinicRoutes(params.slug).admin_appointments_history,
      },
   ];

   return (
      <>
         {adminBody &&
            !pathname.includes('details') &&
            !pathname.includes('clinic-history') &&
            createPortal(
               <nav
                  id="settings-navbar"
                  className="absolute bottom-0 left-0 flex"
               >
                  {options.map((option, i, { length }) => (
                     <Button
                        href={option.route}
                        key={option.name}
                        className={`!w-max flex-none rounded-none !px-6 !py-2 !font-medium !text-black !transition-none hover:!translate-y-0 ${
                           i === 0
                              ? 'rounded-tl-2xl !pl-8'
                              : i === length - 1 && 'rounded-tr-2xl !pr-8'
                        }
                        ${
                           pathname.includes(option.route)
                              ? 'bg-white !font-bold hover:!bg-white'
                              : '!bg-light-gray-background'
                        }
                        `}
                     >
                        {option.name}
                     </Button>
                  ))}
               </nav>,
               adminBody,
            )}

         {children}
      </>
   );
}
