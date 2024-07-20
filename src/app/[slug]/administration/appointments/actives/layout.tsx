'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<unknown>) {
   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: '_',
         }),
      );
   }, [dispatch]);

   return <>{children}</>;
}
