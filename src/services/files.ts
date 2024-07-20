import { InsertMethodResponse } from '@/types/general';
import axios from 'axios';

export async function uploadFile(file: File) {
   const data = new FormData();
   data.append('file', file);
   return await axios.post<string>('files/upload', data);
}

export async function getFile(id: number) {
   return await axios.get<IFile>(`/files/get/${id}`);
}

export async function getAllFiles(slug: string) {
   return await axios.get<IFile[]>('/files/getAll');
}

export async function createFile(data: NewFile) {
   return await axios.post<InsertMethodResponse>('/files/create', data);
}

export async function deleteFileById(id: number) {
   return await axios.delete(`/files/delete/${id}`);
}
