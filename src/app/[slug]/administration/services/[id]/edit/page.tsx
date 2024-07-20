import { getServiceById } from '@/services/service';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import { getAllPackagesByServiceId } from '@/services/package';
import ServiceEditionView from './views/ServiceEditionView';

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

      if (service.removed) throw Error();

      return (
         <ServiceEditionView
            service={service}
            initialPackages={packages}
            slug={slug}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(slug).admin_services);
   }
}
