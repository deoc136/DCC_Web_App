import { getClinicBySlug } from '@/services/clinic';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllUsers } from '@/services/user';
import { SORoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import EditView from './views/EditView';

interface Props {
   params: { slug: string };
}

export const revalidate = 0;

export default async function Page({ params }: Props) {
   try {
      const [{ data }, { data: headquarters }, { data: users }] =
         await Promise.all([
            getClinicBySlug(params.slug),
            getAllHeadquarters(params.slug),
            getAllUsers(params.slug),
         ]);

      return <EditView data={data} headquarters={headquarters} users={users} />;
   } catch (error) {
      redirect(SORoutes.management_clinics);
   }
}
