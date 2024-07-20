import { clinicRoutes } from '@/lib/routes';
import { getAllClinicHistoriesByUserId } from '@/services/clinic-history';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserById } from '@/services/user';
import { redirect } from 'next/navigation';
import HistoryView from './views/HistoryView';
import { createDateAndReturnTime } from '@/lib/utils';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { slug: string; id: string };
}) {
   try {
      const user = (await getUserById(params.slug, params.id)).data;

      if (user.role !== 'PATIENT') throw Error();

      const [
         { data: services },
         { data: therapists },
         { data: clinicHistories },
      ] = await Promise.all([
         getAllServices(params.slug),
         getAllUsersByRole(params.slug, 'THERAPIST'),
         getAllClinicHistoriesByUserId(params.slug, user.id),
      ]);

      return (
         <HistoryView
            patient={user}
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
         clinicRoutes(params.slug).admin_patients_id(Number(params.id)).details,
      );
   }
}
