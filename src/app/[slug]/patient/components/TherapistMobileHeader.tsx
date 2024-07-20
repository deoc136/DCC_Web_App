'use client';

import {
   ArrowBackRounded,
   MenuRounded,
   AccountCircleRounded,
} from '@mui/icons-material';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import Button from '@/components/shared/Button';
import TherapistMobileSidebar from '../../therapist/components/TherpistMobileSidebar';
import { useState } from 'react';

interface ITherapistMobileHeader {}

export default function TherapistMobileHeader({}: ITherapistMobileHeader) {
   const { slug } = useAppSelector(store => store.clinic);

   const { goBackRoute, value } = useAppSelector(store => store.title);

   const goBack = typeof goBackRoute === 'string';
   const title = value.split('/').at(-1);

   const [sidebarOpen, setSidebarOpen] = useState(false);

   return (
      <>
         <TherapistMobileSidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
         />
         <header
            className={`relative grid w-[calc(100%)] items-center gap-5 bg-primary p-5 xl:hidden ${
               goBack ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_1fr_auto]'
            }`}
         >
            {goBack ? (
               <Button
                  className="flex aspect-square !w-8 items-center justify-center !rounded-full bg-white !p-0 !text-black"
                  href={goBackRoute}
                  aria-label="go back button"
               >
                  <ArrowBackRounded />
               </Button>
            ) : (
               <Button
                  className="bg-transparent !p-0"
                  onPress={() => setSidebarOpen(true)}
               >
                  <MenuRounded className="!fill-black text-3xl" />
               </Button>
            )}
            <h1 className="text-center text-base font-semibold">{title}</h1>
            {!goBack && (
               <Button
                  aria-label="my account button"
                  className="!rounded-full bg-transparent !p-0"
                  href={clinicRoutes(slug).therapist_profile}
               >
                  <AccountCircleRounded className="!fill-black text-3xl" />
               </Button>
            )}
         </header>
      </>
   );
}
