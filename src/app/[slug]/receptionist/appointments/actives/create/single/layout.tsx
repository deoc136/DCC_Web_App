'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string } }>) {
   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(params.slug)
               .receptionist_appointments_actives,
            value: 'Reservas / Reservas activas / Crear reserva',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <>{children}</>;
}
