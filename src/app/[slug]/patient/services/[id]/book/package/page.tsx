import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { getServiceById } from '@/services/service';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllTherapists } from '@/services/user';
import { getAllUserServices } from '@/services/user_service';
import { getAllAppointments } from '@/services/appointment';
import CreationView from './views/CreationView';
import { getPackageById } from '@/services/package';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const packageData = (await getPackageById(params.slug, params.id)).data;

      const [
         { data: headquarters },
         { data: therapists },
         { data: userServices },
         { data: appointments },
         { data: service },
      ] = await Promise.all([
         getAllHeadquarters(params.slug),
         getAllTherapists(params.slug),
         getAllUserServices(params.slug),
         getAllAppointments(params.slug),
         getServiceById(params.slug, packageData.service_id.toString()),
      ]);

      if (service.removed || !service.active) throw Error();

      return (
         <CreationView
            service={service}
            headquarters={headquarters}
            therapists={therapists.filter(
               ({ user: { enabled, retired } }) => !retired && enabled,
            )}
            userServices={userServices}
            appointments={appointments.filter(
               ({ state }) => state !== 'CANCELED',
            )}
            packageData={packageData}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).admin_services);
   }
}
