import { Catalog, CatalogType } from '@/types/catalog';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
   countries: Array<Catalog>(),
   cities: Array<Catalog>(),
   identification_types: Array<Catalog>(),
   phone_codes: Array<Catalog>(),
   week_days: Array<Catalog>(),
   hours: Array<Catalog>(),
   nationalities: Array<Catalog>(),
   catalogue_types: Array<CatalogType>(),
};

const cataloguesSlice = createSlice({
   initialState,
   name: 'catalogues',
   reducers: {
      changeCatalogues: (
         state,
         action: PayloadAction<Partial<typeof initialState>>,
      ) => ({ ...state, ...action.payload }),
   },
});

export default cataloguesSlice.reducer;

export const { changeCatalogues } = cataloguesSlice.actions;
