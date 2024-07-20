function softwareOwnerRoutes() {
   const softwareOwner = '/software-owner';

   const login = `${softwareOwner}/auth/login` as const;

   const resetPassword = `${softwareOwner}/auth/reset-password` as const;

   const management = `${softwareOwner}/management` as const;
   const management_clinics = `${management}/clinics` as const;

   const management_clinics_create = `${management_clinics}/create` as const;

   const management_clinic_slug = (slug: string) => {
      const aux = `${management_clinics}/${slug}` as const;
      return {
         edit: `${aux}/edit`,
         details: `${aux}/details`,
      } as const;
   };

   const management_setting = `${management}/settings` as const;

   return {
      softwareOwner,
      login,

      resetPassword,

      management_clinics,
      management_clinics_create,

      management_clinic_slug,

      management_setting,
   } as const;
}

export function admin_routes(slug: string) {
   const admin = `/${slug}/administration` as const;

   const admin_appointments = `${admin}/appointments` as const;
   const admin_services = `${admin}/services` as const;
   const admin_team = `${admin}/team` as const;
   const admin_patients = `${admin}/patients` as const;
   const admin_setting = `${admin}/settings` as const;

   function admin_appointments_id(id: number) {
      const aux = `${admin_appointments}/${id}` as const;
      return {
         history: `${aux}/clinic-history`,
         details: `${aux}/details`,
      } as const;
   }

   function admin_services_id(id: number) {
      const aux = `${admin_services}/${id}` as const;
      return {
         edit: `${aux}/edit`,
         details: `${aux}/details`,
      } as const;
   }

   function admin_team_id(id: number) {
      const aux = `${admin_team}/${id}` as const;
      return {
         edit: `${aux}/edit`,
         details: `${aux}/details`,
      } as const;
   }

   function admin_patients_id(id: number) {
      const aux = `${admin_patients}/${id}` as const;
      return {
         // edit: `${aux}/edit`,
         details: `${aux}/details`,
         details_history: `${aux}/details/clinic-history`,
      } as const;
   }

   return {
      admin_home: `${admin}/home`,

      admin_appointments,
      admin_appointments_actives: `${admin_appointments}/actives`,
      admin_appointments_history: `${admin_appointments}/history`,

      admin_appointments_id,

      admin_services,
      admin_services_create: `${admin_services}/create`,

      admin_services_id,

      admin_team,
      admin_team_create: `${admin_team}/create`,

      admin_team_id,

      admin_patients,

      admin_patients_id,

      admin_setting,
      admin_settings_general: `${admin_setting}/general`,
      admin_settings_general_edit: `${admin_setting}/general/edit`,

      admin_settings_terms_and_policies: `${admin_setting}/terms-and-policies`,
      admin_settings_terms_and_policies_edit: `${admin_setting}/terms-and-policies/edit`,

      admin_settings_forms: `${admin_setting}/forms`,
      admin_settings_forms_edit: `${admin_setting}/forms/edit`,

      admin_settings_profile: `${admin_setting}/profile`,
      admin_settings_profile_edit: `${admin_setting}/profile/edit`,
   } as const;
}

export function therapist_routes(slug: string) {
   const therapist = `/${slug}/therapist` as const;

   const therapist_appointments = `${therapist}/appointments` as const;
   const therapist_patients = `${therapist}/patients` as const;
   const therapist_profile = `${therapist}/profile` as const;

   function therapist_appointments_id(id: number) {
      const aux = `${therapist_appointments}/${id}` as const;
      return {
         history: `${aux}/clinic-history`,
         details: `${aux}/details`,
      } as const;
   }

   function therapist_patients_id(id: number) {
      const aux = `${therapist_patients}/${id}` as const;
      return {
         // edit: `${aux}/edit`,
         details: `${aux}/details`,
         details_history: `${aux}/details/clinic-history`,
      } as const;
   }

   return {
      therapist_patients,
      therapist_patients_id,

      therapist_profile,

      therapist_appointments,
      therapist_appointments_id,
      therapist_appointments_actives: `${therapist_appointments}/actives`,
      therapist_appointments_history: `${therapist_appointments}/history`,
   } as const;
}

export function receptionist_routes(slug: string) {
   const receptionist = `/${slug}/receptionist` as const;

   const receptionist_appointments = `${receptionist}/appointments` as const;
   const receptionist_patients = `${receptionist}/patients` as const;
   const receptionist_profile = `${receptionist}/profile` as const;

   function receptionist_appointments_id(id: number) {
      const aux = `${receptionist_appointments}/${id}` as const;
      return {
         history: `${aux}/clinic-history`,
         details: `${aux}/details`,
         edit: `${aux}/edit`,
      } as const;
   }

   function receptionist_patients_id(id: number) {
      const aux = `${receptionist_patients}/${id}` as const;
      return {
         // edit: `${aux}/edit`,
         details: `${aux}/details`,
         details_history: `${aux}/details/clinic-history`,
      } as const;
   }

   return {
      receptionist_patients,
      receptionist_patients_id,

      receptionist_profile,

      receptionist_appointments,
      receptionist_appointments_id,
      receptionist_appointments_actives: `${receptionist_appointments}/actives`,
      receptionist_appointments_actives_create_single: `${receptionist_appointments}/actives/create/single`,
      receptionist_appointments_actives_create_package: `${receptionist_appointments}/actives/create/package`,
      receptionist_appointments_history: `${receptionist_appointments}/history`,
   } as const;
}

export function patient_routes(slug: string) {
   const patient = `/${slug}/patient` as const;

   const patient_complete_account = `${patient}/complete-account` as const;

   const patient_services = `${patient}/services` as const;
   const patient_appointments = `${patient}/appointments` as const;

   const patient_profile = `${patient}/profile` as const;

   function patient_services_id(id: number) {
      const aux = `${patient_services}/${id}` as const;

      const book = `${aux}/book`;
      return {
         book_single: `${book}/single`,
         book_package: `${book}/package`,
         details: `${aux}/details`,
      } as const;
   }

   function patient_appointments_id(id: number) {
      return {
         details: `${patient_appointments}/${id}/details`,
         edit: `${patient_appointments}/${id}/edit`,
         rate: `${patient_appointments}/${id}/rate`,
      } as const;
   }

   const patient_profile_forms = `${patient_profile}/forms` as const;

   function patient_profile_forms_id(id: number) {
      return {
         submit: `${patient_profile_forms}/${id}/submit`,
      } as const;
   }

   return {
      patient,

      patient_complete_account,

      patient_services,
      patient_services_id,

      patient_appointments,
      patient_appointments_id,
      patient_appointments_actives: `${patient_appointments}/actives`,
      patient_appointments_history: `${patient_appointments}/history`,

      patient_profile,
      patient_profile_personal_data: `${patient_profile}/personal-data`,
      patient_profile_personal_data_edit: `${patient_profile}/personal-data/edit`,

      patient_profile_forms,
      patient_profile_forms_id,

      patient_profile_clinic_history: `${patient_profile}/clinic-history`,
   } as const;
}

export function clinicRoutes(slug: string) {
   return {
      clinic_resetPassword: `/${slug}/auth/reset-password`,
      clinic_activateAccount: `/${slug}/auth/activate-account`,

      login: `/${slug}/auth/login`,
      register: `/${slug}/auth/register`,
      register_success: `/${slug}/auth/register/success`,

      ...admin_routes(slug),

      ...therapist_routes(slug),

      ...receptionist_routes(slug),

      ...patient_routes(slug),
   } as const;
}

export const SORoutes = softwareOwnerRoutes();

type ValueOf<T> = T[keyof T];

type ISORoutes = typeof softwareOwnerRoutes;

export type SoftwareOwnerRoute =
   | ValueOf<ReturnType<ReturnType<ISORoutes>['management_clinic_slug']>>
   | ValueOf<Omit<ReturnType<ISORoutes>, 'management_clinic_slug'>>;

type IClinicRoutes = typeof clinicRoutes;

export type ClinicRoute =
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['admin_appointments_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['admin_appointments_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['admin_services_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['admin_team_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['admin_patients_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['therapist_appointments_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['therapist_patients_id']>>
   | ValueOf<
        ReturnType<ReturnType<IClinicRoutes>['receptionist_appointments_id']>
     >
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['receptionist_patients_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['patient_services_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['patient_appointments_id']>>
   | ValueOf<ReturnType<ReturnType<IClinicRoutes>['patient_profile_forms_id']>>
   | ValueOf<
        Omit<
           ReturnType<IClinicRoutes>,
           | 'admin_services_id'
           | 'admin_team_id'
           | 'admin_patients_id'
           | 'admin_appointments_id'
           | 'therapist_appointments_id'
           | 'therapist_patients_id'
           | 'receptionist_appointments_id'
           | 'receptionist_patients_id'
           | 'patient_services_id'
           | 'patient_appointments_id'
           | 'patient_profile_forms_id'
        >
     >;

export type GlobalRoute = SoftwareOwnerRoute | ClinicRoute;
