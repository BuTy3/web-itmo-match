import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  login: string;
};

type AuthStatus = 'idle' | 'loading' | 'error';

type LoginSuccessPayload = {
  user: AuthUser;
  accessToken: string;
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
}

const getStoredAuth = (): Pick<AuthState, 'user' | 'accessToken'> => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null };
  }

  const accessToken = localStorage.getItem('accessToken');
  const login = localStorage.getItem('nickname');

  return {
    accessToken: accessToken ?? null,
    user: login ? { login } : null,
  };
};

const storedAuth = getStoredAuth();

const initialState: AuthState = {
  user: storedAuth.user,
  accessToken: storedAuth.accessToken,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.status = 'error';
      state.error = action.payload;
    },
    loginSuccess(state, action: PayloadAction<LoginSuccessPayload>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'idle';
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setLoading, setError, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
