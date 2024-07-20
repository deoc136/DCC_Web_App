'use client';

import Button from '@/components/shared/Button';
import Header from '@/components/shared/Header';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ReceptionistHeader() {
   const { goBackRoute, value } = useAppSelector(store => store.title);

   const router = useRouter();

   return (
      <Header>
         <div className="absolute bottom-0 right-0 mr-8 aspect-square w-24">
            <Image
               fill
               className="object-contain"
               alt="clinic logo"
               src="/agenda_ahora_logo_header.png"
            />
         </div>
         <div className="flex items-end gap-5">
            {typeof goBackRoute === 'string' && (
               <Button
                  className="flex aspect-square !w-8 items-center justify-center !rounded-full bg-white !p-0 !text-black"
                  href={goBackRoute}
                  aria-label="go back button"
               >
                  <ArrowBackRoundedIcon />
               </Button>
            )}
            <h3 className="mt-10 text-2xl">{value}</h3>
         </div>
      </Header>
   );
}
