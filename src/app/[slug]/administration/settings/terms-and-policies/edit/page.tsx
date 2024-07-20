import { getClinicBySlug } from '@/services/clinic';
import { getFile } from '@/services/files';
import { getFileFromUrl } from '@/lib/utils';
import FilesEdit from './view/FilesEdit';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const { clinic } = (await getClinicBySlug(params.slug)).data;

   const { terms_and_conditions, clinic_policies, service_policies } = clinic;

   const [termsAndConditions, clinicPolicies, servicePolicies] =
      await Promise.all([
         terms_and_conditions
            ? (await getFile(terms_and_conditions)).data.url
            : null,
         clinic_policies ? (await getFile(clinic_policies)).data.url : null,
         service_policies ? (await getFile(service_policies)).data.url : null,
      ]);

   return (
      <FilesEdit
         clinicPolicies={clinicPolicies}
         servicePolicies={servicePolicies}
         termsAndConditions={termsAndConditions}
         slug={params.slug}
         clinic={clinic}
      />

      // <></>
   );
}
