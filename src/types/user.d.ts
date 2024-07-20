import { Service } from './service';

export type Role = 'ADMINISTRATOR' | 'PATIENT' | 'THERAPIST' | 'RECEPTIONIST';
export type Genre = 'MALE' | 'FEMALE' | 'OTHER';

export interface NewUser {
   enabled: boolean;
   names: string;
   last_names: string;
   phone: string;
   address: string;
   email: string;
   profile_picture: string;
   cognito_id: string;
   role: Role;
   id?: number | undefined;
   identification?: string;
   identification_type?: number;
   headquarter_id?: number;
   retired?: boolean;
   birth_date?: Date;
   genre?: Genre;
   residence_country?: number;
   residence_city?: number;
   nationality?: number;
   date_created: Date;
}

export interface NewUserOutline {
   names: string;
   email: string;
   last_names: string;
   role: string;
   phone: string;
   address?: string;
}

interface NewSchedule {
   days: number[];
   hour_ranges: NewHourRange[];
}

interface NewHourRange {
   start_hour: number;
   end_hour: number;
}

export interface NewFullFilledUser {
   user: NewUser;
   schedules: NewSchedule[];
   services: number[];
}

export interface NewUserService {
   user_id: number;
   service_id: number;
}

//

export interface User {
   id: number;
   enabled: boolean;
   names: string;
   last_names: string;
   phone: string;
   address: string;
   email: string;
   profile_picture: string;
   cognito_id: string;
   role: Role;
   identification?: string;
   identification_type?: number;
   headquarter_id?: number;
   retired: boolean;
   birth_date?: Date;
   genre?: Genre;
   residence_country?: number;
   residence_city?: number;
   nationality?: number;
   date_created: Date;
}

export interface FullFilledUser {
   user: User;
   services: {
      user_service: UserService;
      service: Service;
   }[];
   schedules: Schedule[];
   rating: {
      quality: number | null;
      kindness: number | null;
      punctuality: number | null;
      knowledge: number | null;
   };
}

export interface TherapistWithSchedule
   extends Omit<FullFilledUser, 'services'> {}

export interface UserService {
   id: number;
   user_id: number;
   service_id: number;
}

export interface Schedule {
   id: number;
   days: Day[];
   hour_ranges: HourRange[];
}

export interface Day {
   id: number;
   schedule_id: number;
   day: number;
}

export interface HourRange {
   id: number;
   schedule_id: number;
   start_hour: string;
   end_hour: string;
}
