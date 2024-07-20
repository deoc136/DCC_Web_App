import type { Metadata } from 'next';
import CompleteAccountView from './views/CompleteAccountView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Completa tu cuenta',
   description: meta_descriptions.complete_account,
};

export default function Page() {
   return <CompleteAccountView />;
}
