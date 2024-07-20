import { User } from '@/types/user';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = null as User | null;

const userSlice = createSlice({
   initialState,
   name: 'user',
   reducers: {
      setUser: (_state, action: PayloadAction<typeof initialState>) =>
         action.payload,
   },
});

export default userSlice.reducer;

export const { setUser } = userSlice.actions;
