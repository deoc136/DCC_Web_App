'use client';

import Header from '@/components/shared/Header';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';

interface ISoftOwnHeader {}

export default function SoftOwnHeader({}: ISoftOwnHeader) {
   const { goBackRoute, value } = useAppSelector(store => store.title);

   const router = useRouter();

   return (
      <Header>
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
