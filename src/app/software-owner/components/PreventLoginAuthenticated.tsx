'use client';

import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';
import { signOut } from '@/lib/actions/signOut';
import { GlobalRoute } from '@/lib/routes';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface IPreventLoginAuthenticated {
   route: GlobalRoute;
}

export default function PreventLoginAuthenticated({
   route,
}: IPreventLoginAuthenticated) {
   const router = useRouter();

   useEffect(() => {
      (async () => {
         try {
            const user = await Auth.currentAuthenticatedUser();
            await findSoftwareOwnerByCognitoId(user.username);

            router.push(route as string);
         } catch (error) {
            signOut();
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <></>;
}
