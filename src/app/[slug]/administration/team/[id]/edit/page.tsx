import { getUserFullFilledById } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import EditView from './views/EditView';
import { getAllServices } from '@/services/service';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const [{ data }, { data: services }] = await Promise.all([
         getUserFullFilledById(params.slug, params.id),
         getAllServices(params.slug),
      ]);

      if (data.user.role === 'PATIENT' || data.user.retired) throw Error();

      return <EditView data={data} slug={params.slug} services={services} />;
   } catch (error) {
      redirect(clinicRoutes(params.slug).admin_team);
   }
}
