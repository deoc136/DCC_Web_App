import { Job } from 'node-schedule';

export const jobs = new Map<
   string,
   {
      appointmentId: number;
      job: Job;
   }[]
>();
