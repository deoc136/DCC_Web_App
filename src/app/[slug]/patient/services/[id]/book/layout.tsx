import { clinicRoutes } from '@/lib/routes';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export default async function Layout({
   children,
   params,
}: PropsWithChildren<{ params: { slug: string; id: string } }>) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });
   try {
      await SSR.Auth.currentAuthenticatedUser();

      return <>{children}</>;
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_services);
   }
}
