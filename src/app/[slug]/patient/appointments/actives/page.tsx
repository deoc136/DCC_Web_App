import { getAllAppointmentsByPatientId } from '@/services/appointment';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllServices } from '@/services/service';
import {
   getAllTherapists,
   getAllUsersByRole,
   getUserByCognitoId,
} from '@/services/user';
import { withSSRContext } from 'aws-amplify';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppointmentsList from './views/AppointmentsList';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Citas agendadas',
   description: meta_descriptions.own_active_appointments,
};

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const user = (await getUserByCognitoId(params.slug, username)).data;

   try {
      const [
         { data: appointments },
         { data: services },
         { data: therapists },
         { data: headquarters },
      ] = await Promise.all([
         getAllAppointmentsByPatientId(params.slug, user.id.toString()),
         getAllServices(params.slug),
         getAllUsersByRole(params.slug, 'THERAPIST'),
         getAllHeadquarters(params.slug),
      ]);

      return (
         <AppointmentsList
            appointments={appointments.filter(
               ({ state }) => state !== 'CANCELED' && state !== 'CLOSED',
            )}
            headquarters={headquarters}
            services={services}
            therapists={therapists}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_services);
   }
}
