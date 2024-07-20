export interface Service {
   id: number;
   name: string;
   price: string;
   service_duration: string;
   pause_duration: string | null;
   has_pause: boolean;
   description: string;
   active: boolean;
   picture_url?: string;

   removed: boolean;
}

export interface NewService {
   name: string;
   description: string;
   price: string;
   service_duration: string;
   has_pause: boolean;
   active: boolean;
   id?: number | undefined;
   pause_duration?: string | null | undefined;
   picture_url?: string;

   removed?: boolean;
}
