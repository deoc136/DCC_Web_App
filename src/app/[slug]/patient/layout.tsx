import type { PropsWithChildren } from 'react';
import PatientHeader from './components/PatientHeader';
import PatientFooter from './components/PatientFooter';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { User } from '@/types/user';

interface ILayout extends PropsWithChildren<unknown> {
   params: {
      slug: string;
   };
}

export const revalidate = 0;

export default async function Layout({ children, params }: ILayout) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   try {
      let username = undefined as undefined | string;

      try {
         username = (await SSR.Auth.currentAuthenticatedUser()).username;
      } catch (error) {}

      let user = undefined as undefined | User;

      if (!!username) {
         user = (await getUserByCognitoId(params.slug, username)).data;

         if (user?.role !== 'PATIENT' || !user?.enabled || user?.retired) {
            throw Error("The users isn't a PATIENT or isn`t available.");
         }
      }

      return (
         <main className="relative">
            <div
               id="patient-body"
               className="grid min-h-screen grid-rows-[auto_auto_auto_1fr_auto]"
            >
               <PatientHeader slug={params.slug} user={user} />
               <div className="m-auto h-full w-full max-w-[1920px] self-start px-5 py-10 lg:px-12 lg:py-6">
                  {children}
               </div>
               <PatientFooter />
            </div>
         </main>
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).login);
   }
}
