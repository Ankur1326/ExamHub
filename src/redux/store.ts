import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionTypesReducer from './slices/library/question-bank/questionTypeSlice';
import loadingReducer from "./slices/loadingSlice"
import tagReducer from "./slices/configuration/manage-categories/tagSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        questionTypes: questionTypesReducer,
        loading: loadingReducer,
        tag: tagReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
