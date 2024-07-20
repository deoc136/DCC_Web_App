export interface CatalogType {
   id: number;
   name: string;
   description: string;
   code: string;
   enabled: boolean;
}

export interface Catalog {
   id: number;
   name: string;
   display_name: string;
   description: string;
   code: string;
   enabled: boolean;
   parent_catalog_id: number;
   catalog_type_id: number;
}
