import { InsertMethodResponse } from '@/types/general';
import axios from 'axios';

export async function getAllForms(slug: string) {
   return await axios.get<IFile[]>('/form/getAll', {
      headers: {
         slug,
      },
   });
}

export async function getFormById(slug: string, id: number) {
   return await axios.get<IFile>(`/form/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function createForm(data: NewFile, slug: string) {
   return await axios.post<InsertMethodResponse>('/form/create', data, {
      headers: {
         slug,
      },
   });
}

export async function deleteFormById(id: number, slug: string) {
   return await axios.delete(`/form/delete/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getAllSubmittedFormsByPatientId(
   slug: string,
   id: number,
) {
   return await axios.get<SubmittedFile[]>(
      `/submittedForm/getAllByPatientId/${id}`,
      {
         headers: {
            slug,
         },
      },
   );
}

export async function submitForm(slug: string, data: NewSubmittedFile) {
   return await axios.post('/submittedForm/create', data, {
      headers: {
         slug,
      },
   });
}

export async function deleteSubmittedFormById(id: number, slug: string) {
   return await axios.delete(`/submittedForm/delete/${id}`, {
      headers: {
         slug,
      },
   });
}
