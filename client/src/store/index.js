import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import recipesReducer from './recipesSlice';
import menuReducer from './menuSlice';
import collectionsReducer from './collectionsSlice'
import commentsReducer from './commentsSlice';
import timersReducer, { initWorkerListener, setStore } from './timersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipesReducer,
    menu: menuReducer,
    collections: collectionsReducer,
    comments: commentsReducer,
    timers: timersReducer,
  },
});

setStore(store);
initWorkerListener(store.dispatch);