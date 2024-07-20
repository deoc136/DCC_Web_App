interface ClinicHistory {
   id: number;
   service_id: number;
   date: string;
   hour: number;
   patient_id: number;
   therapist_id: number;
   appointment_id: number;
   content: string;
}

interface NewClinicHistory {
   id?: number;
   service_id: number;
   date: string;
   hour: number;
   patient_id: number;
   therapist_id: number;
   appointment_id: number;
   content: string;
}
