import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
   title: 'Detalles de la cita',
   description: meta_descriptions.appointment_details,
};

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
