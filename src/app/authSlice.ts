import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicUser } from '../../shared/contracts';

type AuthState = { user: PublicUser | null; accessToken: string | null; status: 'checking' | 'authenticated' | 'anonymous' };
const initialState: AuthState = { user: null, accessToken: null, status: 'checking' };

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    sessionReceived: (state, action: PayloadAction<{ user: PublicUser; accessToken: string }>) => {
      state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.status = 'authenticated';
    },
    sessionCleared: (state) => { state.user = null; state.accessToken = null; state.status = 'anonymous'; },
  },
});

export const { sessionReceived, sessionCleared } = authSlice.actions;
export default authSlice.reducer;
