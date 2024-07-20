import { clinicRoutes } from '@/lib/routes';
import {
   getAllAppointmentsByPatientId,
   getAllAppointmentsByPatientIdWithRating,
} from '@/services/appointment';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserByCognitoId } from '@/services/user';
import { withSSRContext } from 'aws-amplify';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AppointmentsList from './views/AppointmentsList';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Historial de citas',
   description: meta_descriptions.own_appointments_history,
};

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const patient = (await getUserByCognitoId(params.slug, username)).data;

   try {
      const [
         { data: appointments },
         { data: services },
         { data: therapists },
         { data: headquarters },
      ] = await Promise.all([
         getAllAppointmentsByPatientIdWithRating(
            params.slug,
            patient.id.toString(),
         ),
         getAllServices(params.slug),
         getAllUsersByRole(params.slug, 'THERAPIST'),
         getAllHeadquarters(params.slug),
      ]);

      return (
         <AppointmentsList
            appointments={appointments
               .filter(
                  ({ state }) => state === 'CANCELED' || state === 'CLOSED',
               )
               .map(appointment => {
                  const service = services.find(
                     ({ id }) => id === appointment.service_id,
                  );

                  const therapist = therapists.find(
                     ({ id }) => id === appointment.therapist_id,
                  );

                  return {
                     appointment,
                     data: {
                        therapist_names: therapist?.names ?? '',
                        therapist_last_names: therapist?.last_names ?? '',
                        patient_names: patient.names,
                        patient_last_names: patient.last_names,
                        patient_phone: patient.phone,
                        service_name: service?.name ?? '',
                     },
                  };
               })}
            headquarters={headquarters}
            slug={params.slug}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_services);
   }
}
