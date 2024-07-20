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
            goBackRoute: clinicRoutes(params.slug).therapist_patients_id(
               params.id,
            ).details,
            value: 'Pacientes / Detalles del paciente / Historia clínica',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <div className="text-sm lg:text-base">{children}</div>;
}
