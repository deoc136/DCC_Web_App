'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { useEffect, type PropsWithChildren } from 'react';

interface ILayout extends PropsWithChildren<unknown> {
   params: {
      slug: string;
      id: number;
   };
}

export default function Layout({ children, params }: ILayout) {
   const dispatch = useAppDispatch();
   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(params.slug).receptionist_appointments_id(
               params.id,
            ).details,
            value: 'Historial de reservas / Detalles de reserva / Historia clínica',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <>{children}</>;
}
