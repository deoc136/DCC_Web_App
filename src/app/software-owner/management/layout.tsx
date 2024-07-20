import type { PropsWithChildren } from 'react';
import SoftOwnSidebar from './components/SoftOwnSidebar';
import { headers } from 'next/headers';
import { withSSRContext } from 'aws-amplify';
import { redirect } from 'next/navigation';
import RevalidationClientSide from '@/app/software-owner/components/RevalidationClientSide';
import SoftOwnHeader from './components/SoftOwnHeader';
import { SORoutes } from '@/lib/routes';
import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';

export default async function Layout({ children }: PropsWithChildren<unknown>) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   try {
      const user = await SSR.Auth.currentAuthenticatedUser();

      await findSoftwareOwnerByCognitoId(user.username);

      return (
         <main className="flex">
            <RevalidationClientSide route={SORoutes.login} />
            <SoftOwnSidebar />
            <div className="grid h-screen w-full grid-rows-[auto_1fr]">
               <SoftOwnHeader />
               <div className="h-full max-w-screen-2xl overflow-hidden bg-primary">
                  <div className="h-full w-full overflow-auto rounded-tl-3xl bg-white px-14 pb-6 pt-10">
                     {children}
                  </div>
               </div>
            </div>
         </main>
      );
   } catch (error) {
      redirect(SORoutes.login);
   }
}
