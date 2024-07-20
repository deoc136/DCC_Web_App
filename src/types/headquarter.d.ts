export interface NewHeadquarter {
   name: string;
   phone: string;
   address: string;
   city: number;
   index: number;
   id?: number | undefined;

   removed?: boolean;
}

export interface Headquarter {
   name: string;
   phone: string;
   address: string;
   city: number;
   index: number;
   id?: number;

   removed: boolean;
}
