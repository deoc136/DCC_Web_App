import { configureStore } from '@reduxjs/toolkit';
import userSlice from './features/user/user_slice';
import titleSlice from './features/title/title_slice';
import cataloguesSlice from './features/catalogues/catalogues_slice';
import clinicSlice from './features/clinic/clinic_slice';
import currenciesSlice from './features/currencies/currencies_slice';
import languageSlice from './features/language/language_slice';

export const store = configureStore({
   reducer: {
      user: userSlice,
      title: titleSlice,
      catalogues: cataloguesSlice,
      clinic: clinicSlice,
      currencies: currenciesSlice,
      language: languageSlice,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
