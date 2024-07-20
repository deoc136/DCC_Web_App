'use client';

import { formatPrice } from '@/lib/utils';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import Card from '@/components/shared/cards/Card';
import useDictionary from '@/lib/hooks/useDictionary';

interface IPaymentResume {
   taxes: number;
   serviceName: string;
   quantity: number;
   servicePrice: number;
}

export default function PaymentResume({
   quantity,
   serviceName,
   servicePrice,
   taxes,
}: IPaymentResume) {
   const dic = useDictionary();

   const clinicCurrency = useClinicCurrency();

   return (
      <Card className="grid gap-5 bg-white" isShadowed>
         <p className="text-xl font-semibold">
            {dic.texts.services.payment_summary}
         </p>
         <div className="grid grid-cols-2 gap-2 text-on-background-text">
            <p className="font-semibold">
               {serviceName} {quantity}{' '}
               {quantity > 1
                  ? dic.texts.various.sessions.toLowerCase()
                  : dic.texts.various.session.toLowerCase()}
            </p>
            <p className="justify-self-end">
               {formatPrice(servicePrice, clinicCurrency)}
            </p>
            <p className="font-semibold">{dic.texts.various.tax}</p>
            <p className="justify-self-end">
               {formatPrice(taxes, clinicCurrency)}
            </p>
         </div>
         <div className="mt-20 flex justify-between border-t border-on-background-light pt-5 text-base font-semibold">
            <p>{dic.texts.various.total?.toUpperCase()}</p>
            <p className="text-secondary">
               {formatPrice(servicePrice + taxes, clinicCurrency)}
            </p>
         </div>
      </Card>
   );
}
