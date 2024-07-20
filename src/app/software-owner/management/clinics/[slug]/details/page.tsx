import { getClinicBySlug } from '@/services/clinic';
import { SORoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import ClinicOverview from './views/ClinicOverview';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllUsers } from '@/services/user';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const [{ data }, { data: headquarters }, { data: users }] =
         await Promise.all([
            getClinicBySlug(params.slug),
            getAllHeadquarters(params.slug),
            getAllUsers(params.slug),
         ]);

      return (
         <ClinicOverview
            users={users}
            headquarters={headquarters}
            data={data}
         />
      );
   } catch (error) {
      redirect(SORoutes.management_clinics);
   }
}
