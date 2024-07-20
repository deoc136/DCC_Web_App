import { getClinicBySlug } from '@/services/clinic';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllUsers } from '@/services/user';
import GeneralSettingsEdit from '../view/GeneralSettingsEdit';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const [{ data }, { data: headquarters }, { data: users }] =
      await Promise.all([
         getClinicBySlug(params.slug),
         getAllHeadquarters(params.slug),
         getAllUsers(params.slug),
      ]);

   return (
      <GeneralSettingsEdit
         users={users}
         headquarters={headquarters}
         data={data}
      />
   );
}
