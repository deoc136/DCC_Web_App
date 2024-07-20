import { ReminderInputType } from '@/app/api/reminder/route';
import {
   Appointment,
   AppointmentWithNames,
   AppointmentWithRating,
   NewAppointment,
} from '@/types/appointment';
import { InsertMethodResponse } from '@/types/general';
import { NewUser } from '@/types/user';
import axios from 'axios';

async function createReminder(data: ReminderInputType) {
   try {
      await axios.post('/api/reminder', data, { baseURL: '' });
   } catch (error) {}
}
async function editReminder(data: ReminderInputType) {
   try {
      axios.put('/api/reminder', data, { baseURL: '' });
   } catch (error) {}
}
async function cancelReminder(data: ReminderInputType) {
   try {
      axios.delete('/api/reminder', {
         data,
         baseURL: '',
      });
   } catch (error) {}
}

export async function getAppointmentById(slug: string, id: string) {
   return await axios.get<Appointment>(`/appointment/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getAllAppointments(slug: string) {
   return await axios.get<Appointment[]>(`/appointment/getAll`, {
      headers: {
         slug,
      },
   });
}

export async function getAllAppointmentsByPatientId(slug: string, id: string) {
   return await axios.get<Appointment[]>(
      `/appointment/getAllByPatientId/${id}`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function getAllAppointmentsByPatientIdWithRating(
   slug: string,
   id: string,
) {
   return await axios.get<AppointmentWithRating[]>(
      `/appointment/getAllByPatientIdWithRating/${id}`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function getAllAppointmentsWithNames(slug: string) {
   return await axios.get<AppointmentWithNames[]>(
      `/appointment/getAllWithNames`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function createAppointment(
   slug: string,
   appointment: NewAppointment,
) {
   const {
      data: { id },
   } = await axios.post<InsertMethodResponse>(
      '/appointment/create',
      appointment,
      {
         headers: {
            slug,
         },
      },
   );

   await createReminder({ slug, appointmentId: id });

   return {
      id,
   };
}

export async function createAppointmentWithPatient(
   slug: string,
   data: {
      user: NewUser;
      appointment: NewAppointment;
   },
) {
   const {
      data: { id },
   } = await axios.post<InsertMethodResponse>(
      '/appointment/createWithPatient',
      data,
      {
         headers: {
            slug,
         },
      },
   );

   await createReminder({ slug, appointmentId: id });

   return { id };
}

export async function createMultipleWithPatient(
   slug: string,
   data: {
      user: NewUser;
      appointments: NewAppointment[];
   },
) {
   const {
      data: { appointment_ids, id },
   } = await axios.post<{ id: number; appointment_ids: number[] }>(
      '/appointment/createMultipleWithPatient',
      data,
      {
         headers: {
            slug,
         },
      },
   );

   await Promise.all([
      [...appointment_ids].map(id =>
         createReminder({ slug, appointmentId: id }),
      ),
   ]);

   return { id };
}

export async function editAppointment(slug: string, appointment: Appointment) {
   const response = await axios.put('/appointment/edit', appointment, {
      headers: {
         slug,
      },
   });

   editReminder({ slug, appointmentId: appointment.id });

   return response;
}

export async function cancelAppointmentById(slug: string, id: number) {
   const response = await axios.post(
      `/appointment/cancelById/${id}`,
      undefined,
      {
         headers: {
            slug,
         },
      },
   );

   cancelReminder({ slug, appointmentId: id });

   return response;
}
