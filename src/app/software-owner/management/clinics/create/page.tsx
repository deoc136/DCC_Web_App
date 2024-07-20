import { Metadata } from 'next';
import CreationView from './views/CreationView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Crear clínica',
   description: meta_descriptions.create_clinic,
};

export default function Page() {
   return <CreationView />;
}
