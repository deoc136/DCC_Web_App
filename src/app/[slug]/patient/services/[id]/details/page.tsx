import { redirect } from 'next/navigation';
import DetailsView from './views/DetailsView';
import { clinicRoutes } from '@/lib/routes';
import { getServiceById } from '@/services/service';
import { getAllPackagesByServiceId } from '@/services/package';

export const revalidate = 0;

export default async function Page({
   params: { id, slug },
}: {
   params: { id: string; slug: string };
}) {
   try {
      const [{ data: service }, { data: packages }] = await Promise.all([
         getServiceById(slug, id),
         getAllPackagesByServiceId(slug, id),
      ]);

      if (service.removed || !service.active) throw Error();

      return <DetailsView service={service} packages={packages} />;
   } catch (error) {
      redirect(clinicRoutes(slug).admin_services);
   }
}
