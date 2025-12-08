import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import uiReducer from '../features/ui/model/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
