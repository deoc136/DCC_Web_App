import { GlobalRoute } from '@/lib/routes';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
   value: '',
   goBackRoute: null as null | GlobalRoute,
};

const titleSlice = createSlice({
   initialState,
   name: 'title',
   reducers: {
      changeTitle: (_state, action: PayloadAction<typeof initialState>) =>
         action.payload,
   },
});

export default titleSlice.reducer;

export const { changeTitle } = titleSlice.actions;
