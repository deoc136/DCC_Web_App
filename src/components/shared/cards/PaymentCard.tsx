'use client';

import { formatPrice } from '@/lib/utils';
import Card from './Card';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import Button from '../Button';
import RefreshRounded from '@mui/icons-material/RefreshRounded';

interface IPaymentCard {
   taxes: number;
   serviceName: string;
   quantity: number;
   servicePrice: number;
   invoiceUrl: string | undefined | null;
}

export default function PaymentCard({
   quantity,
   serviceName,
   servicePrice,
   taxes,
   invoiceUrl,
}: IPaymentCard) {
   const clinicCurrency = useClinicCurrency();

   return (
      <Card className="grid gap-5" isShadowed>
         <div className="grid grid-cols-2 gap-2 text-on-background-text">
            <p className="font-semibold">
               {serviceName} {quantity} {quantity > 1 ? 'sesiones' : 'sesión'}
            </p>
            <p className="justify-self-end">
               {formatPrice(servicePrice, clinicCurrency)}
            </p>
            <p className="font-semibold">Impuesto</p>
            <p className="justify-self-end">
               {formatPrice(taxes, clinicCurrency)}
            </p>
         </div>
         <div className="flex justify-between text-lg font-semibold">
            <p>TOTAL</p>
            <p className="text-secondary">
               {formatPrice(servicePrice + taxes, clinicCurrency)}
            </p>
         </div>
         {invoiceUrl !== null && (
            <div className="border-t border-on-background-light pt-5 text-secondary">
               {invoiceUrl === undefined ? (
                  <div className="flex items-center gap-1">
                     <RefreshRounded className="animate-spin !fill-secondary" />{' '}
                     Cargando enlace de pago
                  </div>
               ) : (
                  <Button
                     onPress={() => {
                        navigator.clipboard.writeText(invoiceUrl);
                     }}
                     className="flex w-max items-center gap-1 bg-transparent !p-0 font-semibold !text-secondary"
                  >
                     <InsertLinkRoundedIcon /> Copiar enlace de pago
                  </Button>
               )}
            </div>
         )}
      </Card>
   );
}
