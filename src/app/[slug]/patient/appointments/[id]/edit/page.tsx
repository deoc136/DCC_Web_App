import type { Metadata } from 'next';
import EditionView from './views/EditionView';
import {
   getAllTherapists,
   getAllUsersByRole,
   getUserById,
} from '@/services/user';
import { getServiceById } from '@/services/service';
import { getHeadquarterById } from '@/services/headquarter';
import { getAllAppointments, getAppointmentById } from '@/services/appointment';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';
import { getAllUserServices } from '@/services/user_service';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const revalidate = 0;

export const metadata: Metadata = {
   title: 'Editar cita',
   description: meta_descriptions.edit_appointment,
};

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const appointment = (await getAppointmentById(params.slug, params.id))
         .data;

      if (
         appointment.hidden ||
         appointment.state === 'CLOSED' ||
         appointment.state === 'CANCELED'
      )
         throw Error();

      const [
         { data: therapists },
         { data: service },
         { data: headquarter },
         { data: appointments },
         { data: userServices },
      ] = await Promise.all([
         getAllTherapists(params.slug),
         getServiceById(params.slug, appointment.service_id.toString()),
         getHeadquarterById(params.slug, appointment.headquarter_id.toString()),
         getAllAppointments(params.slug),
         getAllUserServices(params.slug),
      ]);

      return (
         <EditionView
            appointment={appointment}
            appointments={appointments.filter(
               ({ id }) => id !== appointment.id,
            )}
            service={service}
            headquarter={headquarter}
            therapists={therapists.filter(
               ({ user }) => user.enabled && !user.retired,
            )}
            userServices={userServices}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).patient_appointments_actives);
   }
}
