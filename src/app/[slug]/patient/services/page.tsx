import { getAllServices } from '@/services/service';
import type { Metadata } from 'next';
import ServicesList from './views/ServicesList';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Servicios',
   description: meta_descriptions.patient_services,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const services = (await getAllServices(params.slug)).data;

   return (
      <ServicesList
         services={services.filter(({ active, removed }) => active && !removed)}
      />
   );
}
