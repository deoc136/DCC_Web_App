export interface Rating {
   id: number;
   quality: number;
   kindness: number;
   punctuality: number;
   knowledge: number;
   appointment_id: number;
   patient_id: number;
   therapist_id: number;
}

export interface NewRating {
   id?: number;
   quality: number;
   kindness: number;
   punctuality: number;
   knowledge: number;
   appointment_id: number;
   patient_id: number;
   therapist_id: number;
}
