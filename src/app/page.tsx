import { getAllClinicsPopulated } from '@/services/clinic';
import type { Metadata } from 'next';
import LandingPageView from './views/landing/LandingPageView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Agenda Ahora',
   description: meta_descriptions.landing_page,
};

export default async function Page() {
   const { data: clinics } = await getAllClinicsPopulated();

   return (
      <LandingPageView
         clinics={clinics.filter(
            ({ clinic: { active, removed } }) => active && !removed,
         )}
      />
   );
}
