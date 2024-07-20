import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
   title: 'Iniciar sesión',
   description: meta_descriptions.login,
};

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
