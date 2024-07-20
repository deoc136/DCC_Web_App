import DetailsView from './views/DetailsView';
import { getAppointmentById } from '@/services/appointment';
import { getUserById } from '@/services/user';
import { getServiceById } from '@/services/service';
import { getAllForms, getAllSubmittedFormsByPatientId } from '@/services/forms';
import { getHeadquarterById } from '@/services/headquarter';
import { getAllClinicHistoriesByAppointmentId } from '@/services/clinic-history';
import { redirect } from 'next/navigation';
import { clinicRoutes } from '@/lib/routes';

export const revalidate = 0;

export default async function Page({
   params,
}: {
   params: { id: string; slug: string };
}) {
   try {
      const appointment = (await getAppointmentById(params.slug, params.id))
         .data;

      if (appointment.hidden) throw Error();

      const [
         { data: patient },
         { data: therapist },
         { data: service },
         { data: forms },
         { data: submittedForms },
         { data: headquarter },
         { data: clinicHistories },
      ] = await Promise.all([
         getUserById(params.slug, appointment.patient_id.toString()),
         getUserById(params.slug, appointment.therapist_id.toString()),
         getServiceById(params.slug, appointment.service_id.toString()),
         getAllForms(params.slug),
         getAllSubmittedFormsByPatientId(params.slug, appointment.patient_id),
         getHeadquarterById(params.slug, appointment.headquarter_id.toString()),
         getAllClinicHistoriesByAppointmentId(params.slug, appointment.id),
      ]);

      return (
         <DetailsView
            appointment={appointment}
            forms={forms}
            patient={patient}
            submittedForms={submittedForms}
            therapist={therapist}
            service={service}
            headquarter={headquarter}
            clinicHistories={clinicHistories}
         />
      );
   } catch (error) {
      redirect(clinicRoutes(params.slug).therapist_appointments_actives);
   }
}
