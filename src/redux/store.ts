import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import thunk from 'redux-thunk';

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
