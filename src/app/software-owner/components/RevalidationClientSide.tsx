'use client';

import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';
import { signOut } from '@/lib/actions/signOut';
import { GlobalRoute } from '@/lib/routes';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface IRevalidationClientSide {
   route: GlobalRoute;
}

export default function RevalidationClientSide({
   route,
}: IRevalidationClientSide) {
   const router = useRouter();

   useEffect(() => {
      (async () => {
         try {
            const user = await Auth.currentAuthenticatedUser();
            await findSoftwareOwnerByCognitoId(user.username);
         } catch (error) {
            signOut();
            router.push(route);
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <></>;
}
