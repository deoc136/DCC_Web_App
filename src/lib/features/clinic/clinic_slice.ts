import { Clinic } from '@/types/clinic';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: Clinic = {
   active: false,
   administrator_id: '',
   country: -1,
   id: -1,
   identification: '',
   identification_id: -1,
   name: '',
   profile_picture_url: '',
   slug: '',
   web_page: '',
   hide_for_therapist: null,
   hide_for_receptionist: null,
   hide_for_patients: null,
   currency_id: null,
   removed: false,
   clinic_policies: null,
   terms_and_conditions: null,
   service_policies: null,
   cancelation_hours: 0,
   paypal_id: '',
   paypal_secret_key: '',
};

const userSlice = createSlice({
   initialState,
   name: 'clinic',
   reducers: {
      setClinic: (_state, action: PayloadAction<typeof initialState>) =>
         action.payload,
   },
});

export default userSlice.reducer;

export const { setClinic } = userSlice.actions;
