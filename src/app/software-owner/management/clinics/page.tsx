import { getAllClinicsPopulated } from '@/services/clinic';
import { Metadata } from 'next';
import ClinicsListOverview from './components/ClinicsListOverview';

export const metadata: Metadata = {
   title: 'Administrar clínicas',
   description: '',
};

export const revalidate = 0;

export default async function Page() {
   try {
      const clinics = (await getAllClinicsPopulated()).data;

      return (
         <ClinicsListOverview
            baseClinics={clinics.filter(({ clinic: { removed } }) => !removed)}
         />
      );
   } catch (error) {
      return <ClinicsListOverview baseClinics={[]} />;
   }
}
