'use client';

import { Clinic } from '@/types/clinic';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface IPayPalSetter {
   children: ReactNode;
   clinic: Clinic;
}

export default function PayPalSetter({ children, clinic }: IPayPalSetter) {
   return (
      <PayPalScriptProvider
         options={{
            clientId: clinic.paypal_id,
         }}
      >
         {children}
      </PayPalScriptProvider>
   );
}
