import { InsertMethodResponse } from '@/types/general';
import { Headquarter, NewHeadquarter } from '@/types/headquarter';
import axios from 'axios';

export async function getHeadquarterById(slug: string, id: string) {
   return axios.get<Headquarter>(`/headquarter/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function createHeadquarter(data: NewHeadquarter, slug: string) {
   return axios.post<InsertMethodResponse>('/headquarter/create', data, {
      headers: {
         slug,
      },
   });
}

export async function editHeadquarter(data: Headquarter, slug: string) {
   return axios.put('/headquarter/edit', data, {
      headers: {
         slug,
      },
   });
}

export async function deleteHeadquarter(id: number, slug: string) {
   return axios.delete(`/headquarter/delete/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getAllHeadquarters(slug: string) {
   return axios.get<Headquarter[]>('/headquarter/getAll', {
      headers: {
         slug,
      },
   });
}
