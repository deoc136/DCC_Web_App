import { getClinicBySlug } from '@/services/clinic';
import ClinicSetter from '@/components/shared/setters/ClinicSetter';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import { withSSRContext } from 'aws-amplify';
import { User } from '@/types/user';
import { getUserByCognitoId } from '@/services/user';
import UserSetter from '@/components/shared/setters/UserSetter';
import NotFoundView from '@/views/NotFound/NotFoundView';
import PayPalSetter from '@/components/shared/setters/PayPalSetter';

export const revalidate = 0;

export default async function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string } }>) {
   try {
      let user: User | any = null;

      const { clinic } = (await getClinicBySlug(params.slug)).data;

      if (!clinic.active || clinic.removed) {
         throw Error('The clinic is not currently available');
      }

      try {
         const SSR = withSSRContext({
            req: { headers: { cookie: headers().get('cookie') } },
         });

         const { username } = await SSR.Auth.currentAuthenticatedUser();

         user = (await getUserByCognitoId(params.slug, username)).data;
      } catch (error) {}

      return (
         <PayPalSetter clinic={clinic}>
            <UserSetter user={user} />
            <ClinicSetter clinic={clinic} />
            {children}
         </PayPalSetter>
      );
   } catch (error) {
      return <NotFoundView />;
   }
}
