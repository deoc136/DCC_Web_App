import { Catalog } from './catalog';

export interface ClinicPopulated {
   clinic: Clinic;
   identification_type: Catalog;
   country: Catalog;
}

export interface Clinic {
   id: number;
   name: string;
   web_page: string;
   active: boolean;
   slug: string;
   country: number;
   identification_id: number;
   profile_picture_url: string;
   identification: string;
   administrator_id: string | null;
   hide_for_therapist: boolean | null;
   hide_for_receptionist: boolean | null;
   hide_for_patients: boolean | null;
   currency_id: number | null;

   removed: boolean;

   clinic_policies: number | null;
   terms_and_conditions: number | null;
   service_policies: number | null;

   cancelation_hours: number;

   paypal_id: string;
   paypal_secret_key: string;
}

export interface NewClinic {
   name: string;
   web_page: string;
   slug: string;
   country: number;
   identification_id: number;
   profile_picture_url: string;
   identification: string;
   id?: number | undefined;
   active?: boolean | undefined;
   administrator_id?: string | null | undefined;
   hide_for_therapist?: boolean | null;
   hide_for_receptionist?: boolean | null;
   hide_for_patients?: boolean | null;
   currency_id?: number | null;

   removed?: boolean;

   clinic_policies?: number;
   terms_and_conditions?: number;
   service_policies?: number;

   cancelation_hours?: number;

   paypal_id: string;
   paypal_secret_key: string;
}
