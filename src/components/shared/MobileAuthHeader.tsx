'use client';

import { ArrowBackRounded } from '@mui/icons-material';
import Button from './Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';

interface IMobileAuthHeader {
   title: string;
}

export default function MobileAuthHeader({ title }: IMobileAuthHeader) {
   const { slug } = useAppSelector(store => store.clinic);

   return (
      <div className="relative -left-5 -top-5 right-5 flex w-[calc(100%+2.5rem)] items-center gap-5 bg-primary p-5 sm:hidden">
         <Button
            className="flex aspect-square !w-8 items-center justify-center !rounded-full bg-white !p-0 !text-black"
            href={clinicRoutes(slug).login}
            aria-label="go back button"
         >
            <ArrowBackRounded />
         </Button>

         <h1 className="text-base font-semibold">{title}</h1>
      </div>
   );
}
