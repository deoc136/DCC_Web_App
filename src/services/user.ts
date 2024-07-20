import { InsertMethodResponse } from '@/types/general';
import {
   FullFilledUser,
   NewFullFilledUser,
   NewUser,
   Role,
   TherapistWithSchedule,
   User,
} from '@/types/user';
import axios from 'axios';

export async function createUser(data: NewUser, slug: string) {
   return axios.post<InsertMethodResponse>('/user/create', data, {
      headers: {
         slug,
      },
   });
}

export async function registerUser(data: NewUser, slug: string) {
   return axios.post<InsertMethodResponse>('/user/signUp', data, {
      headers: {
         slug,
      },
   });
}

export async function createUserFullFilled(
   data: NewFullFilledUser,
   slug: string,
) {
   return axios.post<InsertMethodResponse>('/user/createFullFilled', data, {
      headers: {
         slug,
      },
   });
}

export async function editUser(data: User, slug: string) {
   return axios.put('/user/edit', data, {
      headers: {
         slug,
      },
   });
}

export async function getUserById(slug: string, id: string) {
   return await axios.get<User>(`/user/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getUserFullFilledById(slug: string, id: string) {
   return await axios.get<FullFilledUser>(`/user/getFullFilledById/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getTherapistsByServiceId(slug: string, id: string) {
   return await axios.get<TherapistWithSchedule[]>(
      `/user/getTherapistsByServiceId/${id}`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function getAllTherapists(slug: string) {
   return await axios.get<TherapistWithSchedule[]>(`/user/getAllTherapists`, {
      headers: {
         slug,
      },
   });
}

export async function getAllUsers(slug: string) {
   return axios.get<User[]>('/user/getAll', {
      headers: {
         slug,
      },
   });
}

export interface PatientWithAppointment extends User {
   last_appointment: Date | null;
}

export async function getAllPatients(slug: string) {
   return axios.get<{ user: PatientWithAppointment }[]>(
      '/user/getAllPatients',
      {
         headers: {
            slug,
         },
      },
   );
}

export async function getAllUsersByRole(slug: string, role: Role) {
   return axios.get<User[]>(`/user/getAllByRole/${role}`, {
      headers: {
         slug,
      },
   });
}

export async function getAllEmployees(slug: string) {
   const [
      { data: receptionists },
      { data: therapists },
      { data: administrators },
   ] = await Promise.all([
      getAllUsersByRole(slug, 'RECEPTIONIST'),
      getAllUsersByRole(slug, 'THERAPIST'),
      getAllUsersByRole(slug, 'ADMINISTRATOR'),
   ]);

   return [...receptionists, ...therapists, ...administrators];
}

export async function getUserByCognitoId(slug: string, cognitoId: string) {
   return axios.get<User>(`/user/getByCognitoId/${cognitoId}`, {
      headers: {
         slug,
      },
   });
}
