import { Clinic, ClinicPopulated, NewClinic } from '@/types/clinic';
import { InsertMethodResponse } from '@/types/general';
import { Headquarter } from '@/types/headquarter';
import { NewUser } from '@/types/user';
import axios from 'axios';

export async function getClinicBySlug(slug: string) {
   return await axios.get<ClinicPopulated>(`/clinic/getBySlug/${slug}`);
}

export async function getAllClinicsPopulated() {
   return await axios.get<ClinicPopulated[]>(`/clinic/getAllPopulated`);
}

export async function editClinic(data: Clinic) {
   return await axios.put(`/clinic/edit`, data);
}

export async function deleteClinic(id: number) {
   return await axios.delete(`/clinic/delete/${id}`);
}

export async function createClinic(data: NewClinic) {
   return await axios.post<InsertMethodResponse>(`/clinic/create`, data);
}

interface FullFilledClinic {
   clinicData: NewClinic;
   userData: Omit<NewUser, 'cognito_id'>;
   headquarters: Headquarter[];
}

export async function createClinicFullFilled(data: FullFilledClinic) {
   return await axios.post<InsertMethodResponse>(
      `/clinic/createFulfilled`,
      data,
   );
}
