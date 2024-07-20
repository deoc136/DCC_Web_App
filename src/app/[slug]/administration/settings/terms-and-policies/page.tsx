import { getClinicBySlug } from '@/services/clinic';
import FilesView from './view/FilesView';
import { getFile } from '@/services/files';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const { clinic } = (await getClinicBySlug(params.slug)).data;

   const { terms_and_conditions, clinic_policies, service_policies } = clinic;

   const [termsAndConditions, clinicPolicies, servicePolicies] =
      await Promise.all([
         terms_and_conditions
            ? (await getFile(terms_and_conditions)).data
            : null,
         clinic_policies ? (await getFile(clinic_policies)).data : null,
         service_policies ? (await getFile(service_policies)).data : null,
      ]);

   return (
      <FilesView
         clinicPolicies={clinicPolicies}
         servicePolicies={servicePolicies}
         termsAndConditions={termsAndConditions}
         slug={params.slug}
         clinic={clinic}
      />
   );
}
