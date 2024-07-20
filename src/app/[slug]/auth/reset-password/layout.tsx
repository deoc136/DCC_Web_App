import { meta_descriptions } from '@/lib/seo/meta_descriptions';
import { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
   title: 'Restablecer contraseña',
   description: meta_descriptions.reset_password,
};

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
