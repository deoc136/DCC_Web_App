export const adminInitialValues = {
   names: '',
   last_names: '',
   // email: '',
};

export type Values = typeof adminInitialValues;

export const passwordInitialValues = {
   oldPassword: '',
   newPassword: '',
   confirmPassword: '',
};

export type ValuesPassword = typeof passwordInitialValues;
