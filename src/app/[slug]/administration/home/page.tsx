import type { Metadata } from 'next';
import DashboardView from './views/DashboardView';
import {
   getAllAppointments,
   getAllAppointmentsWithNames,
} from '@/services/appointment';
import { getAllPatients } from '@/services/user';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Inicio',
   description: meta_descriptions.admin_dashboard,
};

export default async function Page({ params }: { params: { slug: string } }) {
   const [{ data: patients }, { data: appointments }] = await Promise.all([
      getAllPatients(params.slug),
      getAllAppointmentsWithNames(params.slug),
   ]);

   return (
      <DashboardView
         appointments={appointments.filter(
            ({ appointment: { hidden } }) => !hidden,
         )}
         patients={patients.filter(
            ({ user: { retired, enabled } }) => !retired && enabled,
         )}
      />
   );
}
