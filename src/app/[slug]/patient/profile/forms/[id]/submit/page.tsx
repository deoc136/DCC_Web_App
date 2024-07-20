import { clinicRoutes } from '@/lib/routes';
import { getAllSubmittedFormsByPatientId, getFormById } from '@/services/forms';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SubmitView from './views/SubmitView';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Subir archivo',
   description: meta_descriptions.patient_upload_form,
};

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { slug: string; id: string };
}) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   try {
      const { username } = await SSR.Auth.currentAuthenticatedUser();

      const { data: user } = await getUserByCognitoId(params.slug, username);

      const [{ data: form }, { data: submittedForms }] = await Promise.all([
         getFormById(params.slug, Number(params.id)),
         getAllSubmittedFormsByPatientId(params.slug, user.id),
      ]);

      return (
         <SubmitView
            submittedForms={submittedForms.filter(
               ({ form_id, patient_id }) =>
                  form_id === form.id && patient_id === user.id,
            )}
            form={form}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_profile_forms);
   }
}
