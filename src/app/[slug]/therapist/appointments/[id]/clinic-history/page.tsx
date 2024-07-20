import { clinicRoutes } from '@/lib/routes';
import { getAllClinicHistoriesByAppointmentId } from '@/services/clinic-history';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserById } from '@/services/user';
import { redirect } from 'next/navigation';
import HistoryView from './views/HistoryView';
import { getAppointmentById } from '@/services/appointment';
import { createDateAndReturnTime } from '@/lib/utils';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { slug: string; id: string };
}) {
   try {
      const appointment = (await getAppointmentById(params.slug, params.id))
         .data;

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
         clinicRoutes(params.slug).therapist_appointments_id(Number(params.id))
            .details,
      );
   }
}
