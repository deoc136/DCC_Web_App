import { getAppointmentById } from '@/services/appointment';
import { getUserById } from '@/services/user';
import { getServiceById } from '@/services/service';
import { getHeadquarterById } from '@/services/headquarter';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import DetailsView from './views/DetailsView';
import { Metadata } from 'next';
import { getAllRatingsByAppointmentId } from '@/services/rating';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const revalidate = 0;

export const metadata: Metadata = {
   title: 'Detalles de cita',
   description: meta_descriptions.appointment_details,
};

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const appointment = (await getAppointmentById(params.slug, params.id))
         .data;

      if (appointment.hidden) throw Error();

      const [
         { data: therapist },
         { data: service },
         { data: headquarter },
         {
            data: { length: ratingsCount },
         },
      ] = await Promise.all([
         getUserById(params.slug, appointment.therapist_id.toString()),
         getServiceById(params.slug, appointment.service_id.toString()),
         getHeadquarterById(params.slug, appointment.headquarter_id.toString()),
         getAllRatingsByAppointmentId(params.slug, params.id),
      ]);

      return (
         <DetailsView
            appointment={appointment}
            therapist={therapist}
            service={service}
            headquarter={headquarter}
            isRated={ratingsCount > 0}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_appointments_actives);
   }
}
