'use client';

import Button from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { usePathname, useRouter } from 'next/navigation';
import { type PropsWithChildren, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string } }>) {
   const pathname = usePathname();

   const router = useRouter();

   const dispatch = useAppDispatch();

   const [adminBody, setAdminBody] = useState<Element | null>(null);

   useEffect(() => {
      setAdminBody(document.querySelector('#admin-body header') ?? null);

      dispatch(
         changeTitle({
            goBackRoute: null,
            value: '_',
         }),
      );
   }, [dispatch]);

   const options = [
      {
         name: 'General',
         route: clinicRoutes(params.slug).admin_settings_general,
      },
      {
         name: 'Políticas y condiciones',
         route: clinicRoutes(params.slug).admin_settings_terms_and_policies,
      },
      {
         name: 'Formularios',
         route: clinicRoutes(params.slug).admin_settings_forms,
      },
      {
         name: 'Mi perfil',
         route: clinicRoutes(params.slug).admin_settings_profile,
      },
   ];

   return (
      <>
         {adminBody &&
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
