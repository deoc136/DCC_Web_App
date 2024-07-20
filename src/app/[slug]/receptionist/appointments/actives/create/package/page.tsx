import type { Metadata } from 'next';
import CreationView from './views/CreationView';
import { getAllServices } from '@/services/service';
import { getAllHeadquarters } from '@/services/headquarter';
import { getAllTherapists, getAllUsersByRole } from '@/services/user';
import { getAllUserServices } from '@/services/user_service';
import { getAllAppointments } from '@/services/appointment';
import { getAllPackages } from '@/services/package';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Crear reserva',
   description: meta_descriptions.booking,
};

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const [
      { data: services },
      { data: headquarters },
      { data: therapists },
      { data: patients },
      { data: userServices },
      { data: appointments },
      { data: packages },
   ] = await Promise.all([
      getAllServices(params.slug),
      getAllHeadquarters(params.slug),
      getAllTherapists(params.slug),
      getAllUsersByRole(params.slug, 'PATIENT'),
      getAllUserServices(params.slug),
      getAllAppointments(params.slug),
      getAllPackages(params.slug),
   ]);

   return (
      <CreationView
         headquarters={headquarters}
         services={services.filter(({ removed, active }) => active && !removed)}
         therapists={therapists.filter(
            ({ user: { retired, enabled } }) => enabled && !retired,
         )}
         patients={patients.filter(
            ({ retired, enabled }) => enabled && !retired,
         )}
         userServices={userServices}
         appointments={appointments.filter(({ state }) => state !== 'CANCELED')}
         packages={packages.filter(({ service_id }) =>
            services.some(
               ({ id, removed, active }) =>
                  service_id === id && !removed && active,
            ),
         )}
      />
   );
}
