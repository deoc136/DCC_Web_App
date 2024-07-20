import type { PropsWithChildren } from 'react';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import RevalidationClientSide from './components/RevalidationClientSide';
import ReceptionistSidebar from './components/ReceptionistSidebar';
import ReceptionistHeader from './components/ReceptionistHeader';
import LayoutChildrenWrapper from './components/LayoutChildrenWrapper';

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

      if (user.role !== 'RECEPTIONIST') {
         throw Error("The users isn't a RECEPTIONIST");
      }

      return (
         <main className="flex">
            <RevalidationClientSide
               slug={params.slug}
               route={clinicRoutes(params.slug).login}
            />
            <ReceptionistSidebar />
            <div
               id="receptionist-body"
               className="grid h-screen w-full grid-rows-[auto_1fr]"
            >
               <ReceptionistHeader />
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
