import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import questionTypesReducer from './slices/library/question-bank/questionTypeSlice';
import loadingReducer from "./slices/loadingSlice"
import tagsReducer from "./slices/configuration/manage-categories/tagsSlice"
import categoriesReducer from "./slices/configuration/manage-categories/categoriesSlice"
import sectionsReducer from "./slices/configuration/manage-subjects/sectionsSlice"
import skillsReducer from "./slices/configuration/manage-subjects/skillsSlice"
import topicsReducer from "./slices/configuration/manage-subjects/topicSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        questionTypes: questionTypesReducer,
        loading: loadingReducer,
        tag: tagsReducer,
        sections: sectionsReducer,
        skills: skillsReducer,
        topics: topicsReducer,
        categories: categoriesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
