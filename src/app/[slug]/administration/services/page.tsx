import { Metadata } from 'next';
import ServicesList from './views/ServicesList';
import { getAllServices } from '@/services/service';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Servicios',
   description: meta_descriptions.services,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const services = (await getAllServices(params.slug)).data;

      return <ServicesList slug={params.slug} baseServices={services} />;
   } catch (error) {
      return <ServicesList slug={params.slug} baseServices={[]} />;
   }
}
