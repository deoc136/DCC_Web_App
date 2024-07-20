import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { getServiceById } from '@/services/service';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export async function generateMetadata({
   params,
}: {
   params: { id: string; slug: string };
}): Promise<Metadata> {
   try {
      const service = (await getServiceById(params.slug, params.id)).data;

      return {
         title: service.name,
         description: service.description,
      };
   } catch (error) {
      return {
         title: 'Detalles de servicio',
         description: meta_descriptions.service_details,
      };
   }
}

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
