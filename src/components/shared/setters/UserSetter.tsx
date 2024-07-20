'use client';

import { setUser } from '@/lib/features/user/user_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { User } from '@/types/user';
import { useEffect, useRef } from 'react';

interface IUserSetter {
   user: User | null;
}

export default function UserSetter({ user }: IUserSetter) {
   const dispatch = useAppDispatch();

   const isLoaded = useRef(false);

   !isLoaded.current &&
      (() => {
         dispatch(setUser(user));

         isLoaded.current = true;
      })();

   useEffect(() => {
      dispatch(setUser(user));

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user?.role]);

   return true;
}
