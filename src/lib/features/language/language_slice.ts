import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import es from '../../../dictionaries/es.json';
import en from '../../../dictionaries/en.json';

const languages = [
   {
      key: 'es',
      name: 'Español',
      dictionary: es,
   },
   {
      key: 'en',
      name: 'English',
      dictionary: en,
   },
] as const;

export type Dictionary = (typeof languages)[number]['dictionary'];
export type DictionaryKey = (typeof languages)[number]['key'];
export type DictionaryName = (typeof languages)[number]['name'];

const initialState = {
   language: 'en' as DictionaryKey,
   dictionary: en as Dictionary,
   name: 'English' as DictionaryName,
   languages,
};

const languageSlice = createSlice({
   initialState,
   name: 'language',
   reducers: {
      setLanguage: (state, action: PayloadAction<DictionaryKey>) => {
         const aux = languages.find(({ key }) => key === action.payload)!;

         return {
            ...state,
            dictionary: aux.dictionary,
            language: aux.key,
            name: aux.name,
         };
      },
   },
});

export default languageSlice.reducer;

export const { setLanguage } = languageSlice.actions;
