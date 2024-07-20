import type { Metadata } from 'next';
import FormsList from './FormsList';
import { getAllForms } from '@/services/forms';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Configuración de formularios',
   description: meta_descriptions.forms_management,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const forms = (await getAllForms(params.slug)).data;

      return <FormsList slug={params.slug} forms={forms} />;
   } catch (error) {
      return <FormsList slug={params.slug} forms={[]} />;
   }
}
