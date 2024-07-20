import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
   title: 'Configuración de mi perfil',
   description: meta_descriptions.profile_settings,
};

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
