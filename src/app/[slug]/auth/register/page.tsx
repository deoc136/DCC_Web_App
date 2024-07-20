import type { Metadata } from 'next';
import SignUpView from './view/SignUpView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Regístrate',
   description: meta_descriptions.sign_up,
};

export default function Page() {
   return <SignUpView />;
}
