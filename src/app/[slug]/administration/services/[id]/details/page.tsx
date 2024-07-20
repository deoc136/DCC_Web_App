import { getServiceById } from '@/services/service';
import { clinicRoutes } from '@/lib/routes';
import { notFound, redirect } from 'next/navigation';
import ServiceDetailsView from './views/ServiceDetailsView';
import { getAllPackagesByServiceId } from '@/services/package';
import { getTherapistsByServiceId } from '@/services/user';

export const revalidate = 0;

export default async function Page({
   params: { id, slug },
}: {
   params: { id: string; slug: string };
}) {
   try {
      const [{ data: service }, { data: packages }, { data: therapists }] =
         await Promise.all([
            getServiceById(slug, id),
            getAllPackagesByServiceId(slug, id),
            getTherapistsByServiceId(slug, id),
         ]);

      if (service.removed) throw Error();

      return (
         <ServiceDetailsView
            slug={slug}
            service={service}
            packages={packages}
            id={id}
            therapists={therapists.filter(
               ({ user: { retired, enabled } }) => enabled && !retired,
            )}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(slug).admin_services);
   }
}
