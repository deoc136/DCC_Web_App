import { PropsWithChildren } from 'react';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';

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
