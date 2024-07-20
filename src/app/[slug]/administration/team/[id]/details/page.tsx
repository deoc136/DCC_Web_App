import { getUserFullFilledById } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import DetailsView from './views/DetailsView';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const data = (await getUserFullFilledById(params.slug, params.id)).data;

      if (data.user.role === 'PATIENT' || data.user.retired) throw Error();

      return <DetailsView data={data} slug={params.slug} />;
   } catch (error) {
      redirect(clinicRoutes(params.slug).admin_team);
   }
}
