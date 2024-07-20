import { InsertMethodResponse } from '@/types/general';
import { NewSchedule } from '@/types/user';
import axios from 'axios';

export async function createSchedule(
   schedule: NewSchedule & { user_id: number },
   slug: string,
) {
   return await axios.post<InsertMethodResponse>('/schedule/create', schedule, {
      headers: { slug },
   });
}

export async function deleteSchedule(id: number, slug: string) {
   return await axios.delete(`/schedule/delete/${id}`, { headers: { slug } });
}
