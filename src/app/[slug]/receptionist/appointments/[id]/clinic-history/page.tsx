import { clinicRoutes } from '@/lib/routes';
import { getAllClinicHistoriesByAppointmentId } from '@/services/clinic-history';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserById } from '@/services/user';
import { redirect } from 'next/navigation';
import HistoryView from './views/HistoryView';
import { getAppointmentById } from '@/services/appointment';
import { createDateAndReturnTime } from '@/lib/utils';
import { Metadata } from 'next';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export async function generateMetadata({}: {
   params: { id: string; slug: string };
}): Promise<Metadata> {
   return {
      title: 'Detalles de la cita',
      description: meta_descriptions.appointment_details,
   };
}

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { slug: string; id: string };
}) {
   try {
      const appointment = (await getAppointmentById(params.slug, params.id))
         .data;

      if (appointment.state === 'TO_PAY' || appointment.state === 'PENDING')
         throw Error();

      const [
         { data: services },
         { data: therapists },
         { data: clinicHistories },
      ] = await Promise.all([
         getAllServices(params.slug),
         getAllUsersByRole(params.slug, 'THERAPIST'),
         getAllClinicHistoriesByAppointmentId(params.slug, appointment.id),
      ]);

      return (
         <HistoryView
            appointment={appointment}
            services={services}
            therapists={therapists}
            clinicHistories={clinicHistories.sort(
               (a, b) =>
                  createDateAndReturnTime(b.date, Number(b.hour)) -
                  createDateAndReturnTime(a.date, Number(a.hour)),
            )}
         />
      );
   } catch (error) {
      redirect(
         clinicRoutes(params.slug).receptionist_appointments_id(
            Number(params.id),
         ).details,
      );
   }
}
