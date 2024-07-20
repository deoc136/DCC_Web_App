'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { useMediaQuery } from '@mui/material';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<unknown>) {
   const dispatch = useAppDispatch();

   const isLg = useMediaQuery('(min-width:1024px)');

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: isLg ? '_' : 'Historial de reservas',
         }),
      );
   }, [dispatch, isLg]);

   return <>{children}</>;
}
