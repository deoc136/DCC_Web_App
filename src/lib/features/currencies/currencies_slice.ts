import { Currency } from '@/types/currency';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = [] as Currency[];

const currenciesSlice = createSlice({
   initialState,
   name: 'currencies',
   reducers: {
      changeCurrencies: (
         _state,
         action: PayloadAction<typeof initialState>,
      ) => [...action.payload],
   },
});

export default currenciesSlice.reducer;

export const { changeCurrencies } = currenciesSlice.actions;
