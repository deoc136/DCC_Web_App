import { getAllForms, getAllSubmittedFormsByPatientId } from '@/services/forms';
import { getUserByCognitoId } from '@/services/user';
import { withSSRContext } from 'aws-amplify';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import FormsView from './views/FormsView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Formularios',
   description: meta_descriptions.patient_forms,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const { data: user } = await getUserByCognitoId(params.slug, username);

   const [{ data: submittedForms }, { data: forms }] = await Promise.all([
      getAllSubmittedFormsByPatientId(params.slug, user.id),
      getAllForms(params.slug),
   ]);

   return <FormsView forms={forms} submittedForms={submittedForms} />;
}
