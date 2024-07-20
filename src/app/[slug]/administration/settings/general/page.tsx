import type { Metadata } from 'next';
import { getClinicBySlug } from '@/services/clinic';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllUsers } from '@/services/user';
import GeneralSettingsOverview from './view/GeneralSettingsOverview';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Configuración general',
   description: meta_descriptions.edit_clinic,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const [{ data }, { data: headquarters }, { data: users }] =
      await Promise.all([
         getClinicBySlug(params.slug),
         getAllHeadquarters(params.slug),
         getAllUsers(params.slug),
      ]);

   return (
      <GeneralSettingsOverview
         users={users}
         headquarters={headquarters}
         data={data}
      />
   );
}
