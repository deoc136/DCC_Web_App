import type { Metadata } from 'next';
import MessageView from './views/MessageView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Registro exitoso',
   description: meta_descriptions.sign_up_successfully,
};

export default function Page() {
   return <MessageView />;
}
