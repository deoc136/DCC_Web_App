'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { usePathname } from 'next/navigation';
import { useEffect, type PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<unknown>) {
   const dispatch = useAppDispatch();
   const pathname = usePathname();

   useEffect(() => {
      !pathname.includes('create') &&
         dispatch(
            changeTitle({
               goBackRoute: null,
               value: '_',
            }),
         );
   }, [dispatch, pathname]);

   return <>{children}</>;
}
