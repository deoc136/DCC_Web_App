import { SoftwareOwner } from '@/types/software-owner';
import axios from 'axios';

export async function findSoftwareOwnerByCognitoId(id: string) {
   return await axios.get<SoftwareOwner>(`/softwareOwner/getByCognitoId/${id}`);
}

export async function editSoftwareOwner(user: SoftwareOwner) {
   return await axios.put('/softwareOwner/edit', user);
}
