import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Términos y condiciones',
   description: meta_descriptions.terms_and_conditions_management,
};

export default function Layout({ children }: PropsWithChildren<unknown>) {
   return <>{children}</>;
}
