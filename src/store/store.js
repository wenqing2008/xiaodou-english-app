import { configureStore } from '@reduxjs/toolkit';
import wordsReducer from './wordsSlice';
import learningReducer from './learningSlice';
import userReducer from './userSlice';
import statisticsReducer from './statisticsSlice';

export const store = configureStore({
  reducer: {
    words: wordsReducer,
    learning: learningReducer,
    user: userReducer,
    statistics: statisticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;