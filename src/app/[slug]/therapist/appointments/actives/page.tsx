import { getAllAppointmentsWithNames } from '@/services/appointment';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserByCognitoId } from '@/services/user';
import type { Metadata } from 'next';
import ActiveAppointmentsList from './views/ActiveAppointmentsList';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Reservas activas',
   description: meta_descriptions.active_appointments,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const [therapist, appointments, services, patients] = await Promise.all([
      (await getUserByCognitoId(params.slug, username)).data,
      (await getAllAppointmentsWithNames(params.slug)).data,
      (await getAllServices(params.slug)).data,
      (await getAllUsersByRole(params.slug, 'PATIENT')).data,
   ]);

   return (
      <ActiveAppointmentsList
         slug={params.slug}
         appointments={appointments.filter(
            ({ appointment: { therapist_id } }) =>
               therapist.id === therapist_id,
         )}
         patients={patients}
         services={services}
      />
   );
}
