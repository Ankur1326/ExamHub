import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionTypesReducer from './slices/question-bank/questionTypeSlice';
import loadingReducer from "./slices/loadingSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        questionTypes: questionTypesReducer,
        loading: loadingReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
