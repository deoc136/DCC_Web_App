import {
   convertErrorIntoString,
   cutFullName,
   dayMilliseconds,
   hourMilliseconds,
} from '@/lib/utils';
import schedule from 'node-schedule';
import { z } from 'zod';
import {
   getAllCatalogType,
   getAppointmentById,
   getCatalogByType,
   getClinicBySlug,
   getHeadquarterById,
   getUserById,
   sendEmail,
   sendSMS,
   sendWhatsAppMessage,
} from '../services';
import { jobs } from './utils';
import { Clinic } from '@/types/clinic';
import { User } from '@/types/user';
import { Headquarter } from '@/types/headquarter';

async function sendMail(
   clinic: Clinic,
   date: Date,
   patient: User,
   headquarter: Headquarter,
   therapist: User,
   hour: string,
) {
   await sendEmail({
      content: `<meta content=\"text/html; charset=UTF-8\" http-equiv=\"Content-Type\"/><head></head><body><div style=\"min-height:100vh;width:100%;max-width:640px;background-color:rgb(242,242,250);padding:1.5rem\"><img src=\"${
         clinic.profile_picture_url
      }\" style=\"display:block;outline:none;border:none;text-decoration:none;box-sizing:content-box;width:9rem;padding-left:3rem;padding-right:3rem;padding-top:1.5rem;padding-bottom:1.5rem\"/><section class=\"font-[-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif]\" style=\"border-radius:0.5rem;background-color:rgb(255,255,255);padding:2.75rem\"><div style=\"margin-bottom:1.5rem;font-size:1rem;line-height:1.5rem;color:rgb(96,96,97)\">

      <p>
         Hola ${cutFullName(patient.names, patient.last_names)}, <br /><br />
         Esperamos que este mensaje te encuentre bien. Queremos recordarte sobre tu cita médica programada para mañana. Aquí están los detalles:
         <br /><br />
         <br /><br />
         Fecha: ${date.getDate()} de ${Intl.DateTimeFormat('es', {
            month: 'long',
         }).format(date)} de ${date.getFullYear()}
         <br /><br />
         <br /><br />
         Hora: ${hour}
         <br /><br />
         <br /><br />
         Ubicación: ${headquarter.name} / ${cutFullName(
            therapist.names,
            therapist.last_names,
         )}
         <br /><br />
         <br /><br />
         Si tienes alguna pregunta o necesitas reprogramar la cita, por
         favor comunícate con nosotros lo antes posible.
         <br /><br />
         ¡Esperamos verte mañana!
         <br /><br />
         ${clinic.name}
      </p>

      </div><p style=\"margin-top:0.5rem;font-size:0.75rem;line-height:1rem\">© 2024 Agenda ahora</p></section></div></body>`,
      destinationEmails: [patient.email],

      fromEmail: 'agenda.ahora.dvp@gmail.com',
      subject: `Recordatorio de tu cita médica programada para mañana - ${clinic.name}`,
   });
}

async function sendMessages(
   clinic: Clinic,
   date: Date,
   patient: User,
   headquarter: Headquarter,
   therapist: User,
   code: string,
   hour: string,
) {
   const names = cutFullName(patient.names, patient.last_names);
   const textDate = `${date.getDate()} de ${Intl.DateTimeFormat('es', {
      month: 'long',
   }).format(date)} de ${date.getFullYear()}`;
   const locationAndTherapist = `${headquarter.name} / ${cutFullName(
      therapist.names,
      therapist.last_names,
   )} `;
   const clinicName = clinic.name;

   const messageTemplate = `
¡Hola ${names}! Este es un recordatorio amistoso sobre tu cita médica de mañana. 

Fecha: ${textDate}
  
Hora: ${hour}
  
Ubicación: ${locationAndTherapist}
  
Si necesitas ayuda o quieres reprogramar, llámanos. ¡Nos vemos pronto! ${clinicName}
  `;

   await Promise.all([
      await sendSMS({
         PhoneNumber: `${code}${patient.phone}`,
         Message: messageTemplate,
      }),
      await sendWhatsAppMessage(
         names,
         textDate,
         hour,
         locationAndTherapist,
         clinicName,
         `${code}${patient.phone}`,
      ),
   ]);
}

const dateSchema = z.object({
   appointmentId: z.number(),
   slug: z.string(),
});

export type ReminderInputType = z.TypeOf<typeof dateSchema>;

export async function POST(req: Request) {
   try {
      const parsing = dateSchema.safeParse(await req.json());

      if (parsing.success) {
         const { appointmentId, slug } = parsing.data;

         try {
            const { data: appointment } = await getAppointmentById(
               slug,
               appointmentId,
            );

            const appointmentDate = new Date(
               new Date(appointment.date).getTime() +
                  Number(appointment.hour) * hourMilliseconds,
            );

            const reminderDate = new Date(
               appointmentDate.getTime() - dayMilliseconds,
            );

            if (reminderDate.getTime() < new Date().getTime()) {
               return (Response as any).json(
                  'The appointment is for less than 24 hours.',
               );
            }

            const [
               {
                  data: { clinic },
               },
               { data: patient },
               { data: therapist },
               { data: headquarter },
               { data: catalogTypes },
            ] = await Promise.all([
               getClinicBySlug(slug),
               getUserById(slug, appointment.patient_id.toString()),
               getUserById(slug, appointment.therapist_id.toString()),
               getHeadquarterById(slug, appointment.headquarter_id.toString()),
               getAllCatalogType(),
            ]);

            const [{ data: phoneCodes }, { data: hours }] = await Promise.all([
               getCatalogByType(
                  catalogTypes.find(({ code }) => code === 'PHONE_CODE')!.id,
               ),
               getCatalogByType(
                  catalogTypes.find(({ code }) => code === 'HOUR')!.id,
               ),
            ]);

            const { code: phoneCode } = phoneCodes.find(
               ({ parent_catalog_id }) => clinic.country === parent_catalog_id,
            )!;

            const { display_name: hour } = hours.find(
               ({ code }) => appointment.hour.toString() === code,
            )!;

            const job = schedule.scheduleJob(reminderDate, async () => {
               await Promise.all([
                  await sendMail(
                     clinic,
                     appointmentDate,
                     patient,
                     headquarter,
                     therapist,
                     hour,
                  ),
                  await sendMessages(
                     clinic,
                     appointmentDate,
                     patient,
                     headquarter,
                     therapist,
                     phoneCode,
                     hour,
                  ),
               ]);
            });

            const clinicJobs = jobs.get(slug);

            if (clinicJobs) {
               clinicJobs.push({ appointmentId, job });
            } else {
               jobs.set(slug, [{ appointmentId, job }]);
            }
         } catch (error) {
            console.error(error);
            throw 'The data sent is invalid.';
         }

         return (Response as any).json('Reminder settled.');
      } else {
         throw JSON.parse(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.error(error);
      return (Response as any).json(
         {
            error,
         },
         { status: 400 },
      );
   }
}

export async function PUT(req: Request) {
   try {
      const parsing = dateSchema.safeParse(await req.json());

      if (parsing.success) {
         const { appointmentId, slug } = parsing.data;

         try {
            const { data: appointment } = await getAppointmentById(
               slug,
               appointmentId,
            );

            const appointmentDate = new Date(
               new Date(appointment.date).getTime() +
                  Number(appointment.hour) * hourMilliseconds,
            );

            const reminderDate = new Date(
               appointmentDate.getTime() - dayMilliseconds,
            );

            if (reminderDate.getTime() < new Date().getTime()) {
               return (Response as any).json(
                  'The appointment is for less than 24 hours.',
               );
            }

            const [
               {
                  data: { clinic },
               },
               { data: patient },
               { data: therapist },
               { data: headquarter },
               { data: catalogTypes },
            ] = await Promise.all([
               getClinicBySlug(slug),
               getUserById(slug, appointment.patient_id.toString()),
               getUserById(slug, appointment.therapist_id.toString()),
               getHeadquarterById(slug, appointment.headquarter_id.toString()),
               getAllCatalogType(),
            ]);

            const [{ data: phoneCodes }, { data: hours }] = await Promise.all([
               getCatalogByType(
                  catalogTypes.find(({ code }) => code === 'PHONE_CODE')!.id,
               ),
               getCatalogByType(
                  catalogTypes.find(({ code }) => code === 'HOUR')!.id,
               ),
            ]);

            const { code: phoneCode } = phoneCodes.find(
               ({ parent_catalog_id }) => clinic.country === parent_catalog_id,
            )!;

            const { display_name: hour } = hours.find(
               ({ code }) => appointment.hour.toString() === code,
            )!;

            const job = schedule.scheduleJob(reminderDate, async () => {
               await Promise.all([
                  await sendMail(
                     clinic,
                     appointmentDate,
                     patient,
                     headquarter,
                     therapist,
                     hour,
                  ),
                  await sendMessages(
                     clinic,
                     appointmentDate,
                     patient,
                     headquarter,
                     therapist,
                     phoneCode,
                     hour,
                  ),
               ]);
            });

            const clinicJobs = jobs.get(slug);

            if (clinicJobs) {
               const oldJobIndex = clinicJobs.findIndex(
                  ({ appointmentId }) => appointmentId === appointment.id,
               );

               clinicJobs.slice(oldJobIndex, 1);

               clinicJobs.push({ appointmentId, job });
            } else {
               jobs.set(slug, [{ appointmentId, job }]);
            }
         } catch (error) {
            throw 'The data sent is invalid.';
         }

         return (Response as any).json('Reminder settled.');
      } else {
         throw JSON.parse(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.error(error);
      return (Response as any).json(
         {
            error,
         },
         { status: 400 },
      );
   }
}

export async function DELETE(req: Request) {
   try {
      const parsing = dateSchema.safeParse(await req.json());

      if (parsing.success) {
         const { appointmentId, slug } = parsing.data;

         const clinicJobs = jobs.get(slug);

         if (clinicJobs) {
            const oldJobIndex = clinicJobs.findIndex(
               ({ appointmentId: id }) => id === appointmentId,
            );

            clinicJobs.splice(oldJobIndex, 1);
         }

         return (Response as any).json('Reminder deleted.');
      } else {
         throw JSON.parse(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.error(error);
      return (Response as any).json(
         {
            error,
         },
         { status: 400 },
      );
   }
}
