import { InsertMethodResponse } from '@/types/general';
import axios from 'axios';

export async function assignNewPassword(email: string, newPassword: string) {
   return await axios.post<InsertMethodResponse>('/auth/assign-password', {
      email,
      newPassword,
   });
}
