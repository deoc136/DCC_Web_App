import pp from 'public/default_profile_picture.svg';

export const clinicInitialValues = {
   name: '',
   country: '',
   webPage: '',
   document: '',
   documentType: '',
   image: undefined as File | undefined | string,
   active: true,
   slug: '',
   paypal_id: '',
   paypal_secret_key: '',
   headquarters: [
      {
         index: 0,
         name: '',
         city: '',
         address: '',
         phoneNumber: '',
         removed: false,
      },
   ],
   administrator: {
      names: '',
      lastNames: '',
      email: '',
      phone: '',
      image: pp.src,
   },
};

export type Values = typeof clinicInitialValues;

export enum ClinicCreationState {
   clinic,
   administrator,
   preview,
}
