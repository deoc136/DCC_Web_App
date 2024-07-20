import { getAllAppointmentsWithNames } from '@/services/appointment';
import { getAllServices } from '@/services/service';
import { getAllUsersByRole } from '@/services/user';
import type { Metadata } from 'next';
import AppointmentsHistoryList from './views/AppointmentsHistoryList';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Historial de reservas',
   description: meta_descriptions.appointments_history,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const [appointments, services, therapists, patients] = await Promise.all([
      (await getAllAppointmentsWithNames(params.slug)).data,
      (await getAllServices(params.slug)).data,
      (await getAllUsersByRole(params.slug, 'THERAPIST')).data,
      (await getAllUsersByRole(params.slug, 'PATIENT')).data,
   ]);

   return (
      <AppointmentsHistoryList
         slug={params.slug}
         appointments={appointments}
         patients={patients}
         services={services}
         therapists={therapists}
      />
   );
}
