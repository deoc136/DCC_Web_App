import type { PropsWithChildren } from 'react';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import TherapistHeader from './components/TherapistHeader';
import RevalidationClientSide from './components/RevalidationClientSide';
import TherapistSidebar from './components/TherapistSidebar';
import LayoutChildrenWrapper from './components/LayoutChildrenWrapper';
import TherapistMobileHeader from '../patient/components/TherapistMobileHeader';

interface ILayout extends PropsWithChildren<unknown> {
   params: {
      slug: string;
   };
}

export default async function Layout({ children, params }: ILayout) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   try {
      const { username } = await SSR.Auth.currentAuthenticatedUser();

      const user = (await getUserByCognitoId(params.slug, username)).data;

      if (user.role !== 'THERAPIST') {
         throw Error("The users isn't a THERAPIST");
      }

      return (
         <main className="flex">
            <RevalidationClientSide
               slug={params.slug}
               route={clinicRoutes(params.slug).login}
            />
            <TherapistSidebar />
            <div
               id="therapist-body"
               className="grid h-screen w-full grid-rows-[auto_1fr] text-sm sm:text-base"
            >
               <TherapistHeader />
               <TherapistMobileHeader />
               <LayoutChildrenWrapper slug={params.slug}>
                  {children}
               </LayoutChildrenWrapper>
            </div>
         </main>
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).login);
   }
}
