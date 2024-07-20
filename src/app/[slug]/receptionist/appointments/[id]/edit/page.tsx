import { clinicRoutes } from '@/lib/routes';
import { getAllAppointments, getAppointmentById } from '@/services/appointment';
import { getAllForms, getAllSubmittedFormsByPatientId } from '@/services/forms';
import { getHeadquarterById } from '@/services/headquarter';
import { getServiceById } from '@/services/service';
import { getAllTherapists, getUserById } from '@/services/user';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EditView from './views/EditView';
import { getAllUserServices } from '@/services/user_service';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Editar cita',
   description: meta_descriptions.edit_appointment,
};

export const revalidate = 0;

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
         { data: patient },
         { data: service },
         { data: forms },
         { data: submittedForms },
         { data: headquarter },
         { data: therapists },
         { data: userServices },
         { data: appointments },
      ] = await Promise.all([
         getUserById(params.slug, appointment.patient_id.toString()),
         getServiceById(params.slug, appointment.service_id.toString()),
         getAllForms(params.slug),
         getAllSubmittedFormsByPatientId(params.slug, appointment.patient_id),
         getHeadquarterById(params.slug, appointment.headquarter_id.toString()),
         getAllTherapists(params.slug),
         getAllUserServices(params.slug),
         getAllAppointments(params.slug),
      ]);

      return (
         <EditView
            appointments={appointments.filter(
               ({ id }) => id !== appointment.id,
            )}
            appointment={appointment}
            forms={forms}
            patient={patient}
            submittedForms={submittedForms}
            service={service}
            headquarter={headquarter}
            therapists={therapists.filter(
               ({ user }) => user.enabled && !user.retired,
            )}
            userServices={userServices}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).receptionist_appointments_actives);
   }
}
