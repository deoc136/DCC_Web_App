import PreventLoginAuthenticated from '@/app/software-owner/components/PreventLoginAuthenticated';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import Image from 'next/image';
import { SORoutes } from '@/lib/routes';
import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';

export default async function Layout({ children }: PropsWithChildren<unknown>) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   try {
      const user = await SSR.Auth.currentAuthenticatedUser();
      await findSoftwareOwnerByCognitoId(user.username);
      redirect(SORoutes.management_clinics);
   } catch (error) {
      return (
         <main className="flex min-h-screen items-center">
            <PreventLoginAuthenticated route={SORoutes.management_clinics} />
            <section className="bg-middle-gray sticky top-0 hidden h-screen w-1/2 flex-none self-start lg:block">
               <div className="relative h-full w-full">
                  <Image
                     src="/auth-flows-background.jpg"
                     alt="auth flow background"
                     fill
                     className="object-cover object-left"
                     priority
                  />
               </div>
            </section>
            <section className="m-8 w-full max-w-screen-sm sm:m-28">
               {children}
            </section>
         </main>
      );
   }
}
