import type { PropsWithChildren } from 'react';
import Image from 'next/image';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import PreventLoginAuthenticated from './components/PreventLoginAuthenticated';
import { getClinicBySlug } from '@/services/clinic';
import { Role, User } from '@/types/user';

interface ILayout extends PropsWithChildren<unknown> {
   params: {
      slug: string;
   };
}

export default async function Layout({ children, params }: ILayout) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   let user = undefined as undefined | User;

   try {
      const { username } = await SSR.Auth.currentAuthenticatedUser();
      user = (await getUserByCognitoId(params.slug, username)).data;
   } catch (error) {
      return (
         <main className="relative flex min-h-screen items-stretch">
            <PreventLoginAuthenticated slug={params.slug} />
            <section
               id="auth_background"
               className="bg-middle-gray sticky top-0 hidden h-screen w-1/2 min-w-[6rem] flex-none self-start transition-all ease-in lg:block"
            >
               <div className="relative h-full w-full">
                  <Image
                     src="/auth-flows-background.jpg"
                     alt="auth flow background"
                     fill
                     className="object-cover object-[30%]"
                     priority
                  />
               </div>
            </section>
            <section className="m-5 w-full max-w-screen-lg sm:p-10 lg:mx-8 lg:my-10 lg:p-20">
               {children}
            </section>
         </main>
      );
   } finally {
      switch (user?.role) {
         case 'ADMINISTRATOR':
            const { clinic } = (await getClinicBySlug(params.slug)).data;

            if (clinic.administrator_id !== user.cognito_id) {
               throw Error("The users isn't the ADMINISTRATOR");
            } else {
               redirect(clinicRoutes(params.slug).admin_services);
            }

         case 'THERAPIST':
            redirect(clinicRoutes(params.slug).therapist_appointments_actives);
         case 'RECEPTIONIST':
            redirect(
               clinicRoutes(params.slug).receptionist_appointments_actives,
            );
         case 'PATIENT':
            redirect(clinicRoutes(params.slug).patient_services);
         default:
            break;
      }
   }
}
