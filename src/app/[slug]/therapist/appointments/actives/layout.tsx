'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { useMediaQuery } from '@mui/material';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<unknown>) {
   const dispatch = useAppDispatch();

   const isXl = useMediaQuery('(min-width:1280px)');

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: isXl ? '_' : 'Reservas activas',
         }),
      );
   }, [dispatch, isXl]);

   return <>{children}</>;
}
