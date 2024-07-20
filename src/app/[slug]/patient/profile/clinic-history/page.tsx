import { getAllClinicHistoriesByUserId } from '@/services/clinic-history';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole, getUserByCognitoId } from '@/services/user';
import { redirect } from 'next/navigation';
import { createDateAndReturnTime } from '@/lib/utils';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import HistoryView from './views/HistoryView';
import type { Metadata } from 'next';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Historia clínica',
   description: meta_descriptions.patient_clinic_history,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const { data: user } = await getUserByCognitoId(params.slug, username);

   const [{ data: services }, { data: therapists }, { data: clinicHistories }] =
      await Promise.all([
         getAllServices(params.slug),
         getAllUsersByRole(params.slug, 'THERAPIST'),
         getAllClinicHistoriesByUserId(params.slug, user.id),
      ]);

   return (
      <HistoryView
         patient={user}
         services={services}
         therapists={therapists}
         clinicHistories={clinicHistories.sort(
            (a, b) =>
               createDateAndReturnTime(b.date, Number(b.hour)) -
               createDateAndReturnTime(a.date, Number(a.hour)),
         )}
      />
   );
}
