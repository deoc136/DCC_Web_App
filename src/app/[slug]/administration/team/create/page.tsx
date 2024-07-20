import type { Metadata } from 'next';
import CreationView from './views/CreationView';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllServices } from '@/services/service';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Crear personal',
   description: meta_descriptions.create_employee,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const [{ data: headquarters }, { data: services }] = await Promise.all([
         getAllHeadquarters(params.slug),
         getAllServices(params.slug),
      ]);

      return (
         <CreationView
            services={services}
            slug={params.slug}
            headquarters={headquarters}
         />
      );
   } catch (error) {
      return (
         <CreationView services={[]} slug={params.slug} headquarters={[]} />
      );
   }
}
