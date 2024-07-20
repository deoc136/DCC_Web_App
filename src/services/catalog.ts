import { Catalog, CatalogType } from '@/types/catalog';
import axios from 'axios';

export async function getAllCatalogType() {
   return await axios.get<CatalogType[]>('/catalogType/getAll');
}

export async function getAllCatalog() {
   return await axios.get<Catalog[]>('/catalog/getAll');
}

export async function getCatalogByType(id: number) {
   return await axios.get<Catalog[]>(`/catalog/getByTypeId/${id}`);
}

export async function getCatalogById(id: number) {
   return await axios.get<Catalog>(`/catalog/get/${id}`);
}
