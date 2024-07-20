import { PatientWithAppointment, getAllPatients } from '@/services/user';
import type { Metadata } from 'next';
import PatientsList from './views/PatientsList';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Pacientes',
   description: meta_descriptions.patients,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   try {
      const users = (await getAllPatients(params.slug)).data;

      return (
         <PatientsList
            users={
               users
                  .map(({ user }) => (!user.retired ? user : undefined))
                  .filter(
                     user => user !== undefined,
                  ) as PatientWithAppointment[]
            }
            slug={params.slug}
         />
      );
   } catch (error) {
      <PatientsList users={[]} slug={params.slug} />;
   }
}
