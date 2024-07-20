import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { getAppointmentById } from '@/services/appointment';
import { getUserById } from '@/services/user';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export async function generateMetadata({
   params,
}: {
   params: { id: string; slug: string };
}): Promise<Metadata> {
   return {
      title: `Detalles de la cita`,
      description: meta_descriptions.appointment_details,
   };
}

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <div className="text-sm lg:text-base">{children}</div>;
}
