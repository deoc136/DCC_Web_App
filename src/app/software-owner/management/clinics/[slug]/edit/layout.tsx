'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { SORoutes } from '@/lib/routes';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<unknown>) {
   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: SORoutes.management_clinics,
            value: 'Administrar clínica / Editar clínica',
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <div>{children}</div>;
}
