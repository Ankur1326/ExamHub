import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionTypesReducer from './slices/library/question-bank/questionTypeSlice';
import loadingReducer from "./slices/loadingSlice"
import tagsReducer from "./slices/configuration/manage-categories/tagsSlice"
import categoriesReducer from "./slices/configuration/manage-categories/categoriesSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        questionTypes: questionTypesReducer,
        loading: loadingReducer,
        tag: tagsReducer,
        categories: categoriesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
