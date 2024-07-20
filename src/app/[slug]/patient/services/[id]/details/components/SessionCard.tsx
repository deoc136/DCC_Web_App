'use client';

import LoginModal from '@/app/[slug]/patient/components/LoginModal';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/cards/Card';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import useDictionary from '@/lib/hooks/useDictionary';
import { GlobalRoute, clinicRoutes } from '@/lib/routes';
import { formatPrice } from '@/lib/utils';
import { Service } from '@/types/service';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ISessionCard {
   description?: string;
   price: number;
   url: GlobalRoute;
   title: string;
}

export default function SessionCard({
   price,
   description,
   url,
   title,
}: ISessionCard) {
   const dic = useDictionary();

   const clinicCurrency = useClinicCurrency();

   const router = useRouter();

   const user = useAppSelector(store => store.user);
   const [isLoginOpen, setIsLoginOpen] = useState(false);

   return (
      <>
         <LoginModal
            setIsOpen={setIsLoginOpen}
            isOpen={isLoginOpen}
            redirectRoute={url}
         />
         <Card className="min-w-[calc(50% - 10px)] flex w-full flex-col justify-between gap-7 text-center lg:gap-10">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {description && <p>{description}</p>}
            <p className="text-3xl font-bold">
               {formatPrice(price, clinicCurrency)}
            </p>
            <Button
               className="self-center lg:max-w-sm"
               onPress={() =>
                  !!user ? router.push(url) : setIsLoginOpen(true)
               }
            >
               {dic.texts.flows.book}
            </Button>
         </Card>
      </>
   );
}
