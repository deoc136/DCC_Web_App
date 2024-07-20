import { clinicRoutes } from '@/lib/routes';
import { getUserById } from '@/services/user';
import { redirect } from 'next/navigation';
import DetailsView from './views/DetailsView';
import { getAllForms, getAllSubmittedFormsByPatientId } from '@/services/forms';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const user = (await getUserById(params.slug, params.id)).data;

      if (user.role !== 'PATIENT' || user.retired) throw Error();

      const [{ data: submittedForms }, { data: forms }] = await Promise.all([
         getAllSubmittedFormsByPatientId(params.slug, user.id),
         getAllForms(params.slug),
      ]);

      return (
         <DetailsView
            user={user}
            forms={forms}
            submittedForms={submittedForms}
            slug={params.slug}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).receptionist_patients);
   }
}
