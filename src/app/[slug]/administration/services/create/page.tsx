import type { Metadata } from 'next';
import CreationView from './views/CreationView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Crear servicio',
   description: meta_descriptions.create_service,
};

export default function Page({ params }: { params: { slug: string } }) {
   return <CreationView slug={params.slug} />;
}
