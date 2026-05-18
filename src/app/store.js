import { configureStore } from '@reduxjs/toolkit';
import { discoveryApi } from '../services/discoveryApi.js';
import { socialApi } from '../services/socialApi.js';
import uiReducer from '../features/ui/uiSlice.js';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [discoveryApi.reducerPath]: discoveryApi.reducer,
    [socialApi.reducerPath]: socialApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(discoveryApi.middleware, socialApi.middleware),
});
