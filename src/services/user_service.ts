import { InsertMethodResponse } from '@/types/general';
import { NewUserService, UserService } from '@/types/user';
import axios from 'axios';

export async function getAllUserServices(slug: string) {
   return await axios.get<UserService[]>(`/userService/getAll`, {
      headers: { slug },
   });
}

export async function createUserService(data: NewUserService, slug: string) {
   return await axios.post<InsertMethodResponse>(`/userService/create`, data, {
      headers: { slug },
   });
}

export async function deleteUserService(id: number, slug: string) {
   return await axios.delete(`/userService/delete/${id}`, {
      headers: { slug },
   });
}
