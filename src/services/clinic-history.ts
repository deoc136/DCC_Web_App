import axios from 'axios';

export async function getAllClinicHistoriesByUserId(slug: string, id: number) {
   return axios.get<ClinicHistory[]>(`/clinicHistory/getAllByPatientId/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getAllClinicHistoriesByAppointmentId(
   slug: string,
   id: number,
) {
   return axios.get<ClinicHistory[]>(
      `/clinicHistory/getAllByAppointmentId/${id}`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function createClinicHistory(
   slug: string,
   history: NewClinicHistory,
) {
   return axios.post('/clinicHistory/create', history, {
      headers: {
         slug,
      },
   });
}
