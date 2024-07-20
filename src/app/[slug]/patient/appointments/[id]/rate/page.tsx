import type { Metadata } from 'next';
import RatingView from './views/RatingView';
import { getAppointmentById } from '@/services/appointment';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { getAllRatingsByAppointmentId } from '@/services/rating';
import { getServiceById } from '@/services/service';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Calificar servicio',
   description: meta_descriptions.rate_appointment,
};

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const [
         {
            data: { length },
         },
         { data: appointment },
      ] = await Promise.all([
         getAllRatingsByAppointmentId(params.slug, params.id),
         getAppointmentById(params.slug, params.id),
      ]);

      if (
         length > 0 ||
         appointment.hidden ||
         appointment.state !== 'CLOSED' ||
         appointment.assistance !== 'ATTENDED'
      )
         throw Error();

      const { data: service } = await getServiceById(
         params.slug,
         appointment.service_id.toString(),
      );

      return <RatingView service={service} appointment={appointment} />;
   } catch (error) {
      redirect(
         clinicRoutes(params.slug).patient_appointments_id(Number(params.id))
            .details,
      );
   }
}
