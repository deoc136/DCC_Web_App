import { InsertMethodResponse } from '@/types/general';
import { NewService, Service } from '@/types/service';
import axios from 'axios';

export async function getAllServices(slug: string) {
   return await axios.get<Service[]>('/service/getAll', {
      headers: {
         slug,
      },
   });
}

export async function getServiceById(slug: string, id: string) {
   return await axios.get<Service>(`/service/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function createService(service: NewService, slug: string) {
   return await axios.post<InsertMethodResponse>('/service/create', service, {
      headers: { slug },
   });
}

export async function editService(service: Service, slug: string) {
   return await axios.put('/service/edit', service, {
      headers: { slug },
   });
}

export async function deleteService(id: number, slug: string) {
   return await axios.delete(`/service/delete/${id}`, { headers: { slug } });
}
