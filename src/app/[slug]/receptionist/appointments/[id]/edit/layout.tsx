'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string; id: string } }>) {
   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(params.slug).receptionist_appointments_id(
               Number(params.id),
            ).details,
            value: 'Reservas / Reservas activas / Editar reserva',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <>{children}</>;
}
