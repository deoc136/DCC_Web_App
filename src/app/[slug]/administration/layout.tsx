import type { PropsWithChildren } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import { getClinicBySlug } from '@/services/clinic';
import RevalidationClientSide from './components/RevalidationClientSide';
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

      const [
         { data: user },
         {
            data: { clinic },
         },
      ] = await Promise.all([
         getUserByCognitoId(params.slug, username),
         getClinicBySlug(params.slug),
      ]);

      if (
         user.role !== 'ADMINISTRATOR' ||
         clinic.administrator_id !== username
      ) {
         throw Error("The users isn't the ADMINISTRATOR");
      }

      return (
         <main className="flex">
            <RevalidationClientSide
               slug={params.slug}
               route={clinicRoutes(params.slug).login}
            />
            <AdminSidebar clinic={clinic} />
            <div
               id="admin-body"
               className="grid h-screen w-full grid-rows-[auto_1fr]"
            >
               <AdminHeader />
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
