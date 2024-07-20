import { getAllEmployees, getAllUsers } from '@/services/user';
import type { Metadata } from 'next';
import TeamList from './views/TeamList';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Equipo',
   description: meta_descriptions.employee_details,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const users = await getAllEmployees(params.slug);

      return (
         <TeamList
            baseUsers={users.filter(user => !user.retired)}
            slug={params.slug}
         />
      );
   } catch (error) {
      return <TeamList baseUsers={[]} slug={params.slug} />;
   }
}
