'use client';

import { setClinic } from '@/lib/features/clinic/clinic_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { Clinic } from '@/types/clinic';
import { usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useEffect, useRef } from 'react';

interface IClinicSetter {
   clinic: Clinic;
}

export default function ClinicSetter({ clinic }: IClinicSetter) {
   const dispatch = useAppDispatch();

   const [{ options }, paypalDispatch] = usePayPalScriptReducer();

   const isLoaded = useRef(false);

   !isLoaded.current &&
      (() => {
         dispatch(setClinic(clinic));

         isLoaded.current = true;
      })();

   const clientId = useAppSelector(store => store.clinic.paypal_id);

   useEffect(() => {
      paypalDispatch({
         type: 'resetOptions',
         value: {
            ...options,
            clientId,
         },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [clientId]);

   return true;
}
