import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { getClinicBySlug } from '@/services/clinic';
import type { PropsWithChildren } from 'react';

export async function generateMetadata({
   params,
}: {
   params: { slug: string };
}) {
   try {
      const data = (await getClinicBySlug(params.slug)).data;

      return {
         title: data.clinic.name,
         description: meta_descriptions.clinic_details,
      };
   } catch (error) {
      return {
         title: params.slug,
         description: meta_descriptions.clinic_details,
      };
   }
}

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
