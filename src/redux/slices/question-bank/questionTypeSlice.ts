import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../loadingSlice";

// Types for the state
interface QuestionType {
    id: string;
    name: string;
    isActive: boolean;
}

interface QuestionTypesState {
    questionTypes: QuestionType[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial state
const initialState: QuestionTypesState = {
    questionTypes: [],
    status: 'idle',
    error: null,
};

export const fetchQuestionTypes = createAsyncThunk<QuestionType[], void, { rejectValue: string }>(
    'questionTypes/fetchQuestionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/admin/question-bank/question-types/get');
            if (!response.ok) {
                return rejectWithValue('Failed to fetch question types');
            }

            const data = await response.json();
            return data.data || [];
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        }
    }
);

// Toggle question type status thunk
export const toggleQuestionTypeStatus = createAsyncThunk<QuestionType, { id: string }, { rejectValue: string }>(
    'questionTypes/toggleQuestionTypeStatus',
    async ({ id }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            const response = await axios.post(`/api/admin/question-bank/question-types/toggle-status`, { id });

            return response.data.updatedQuestionTypes;
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

const questionTypesSlice = createSlice({
    name: 'questionTypes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestionTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchQuestionTypes.fulfilled, (state, action: PayloadAction<QuestionType[]>) => {
                state.status = 'succeeded';
                state.questionTypes = action.payload;
            })
            .addCase(fetchQuestionTypes.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch question types';
            })
            .addCase(toggleQuestionTypeStatus.fulfilled, (state, action: any) => {
                const index = state.questionTypes.findIndex(type => type.id === action.payload.id);
                if (index !== -1) {
                    // state.questionTypes[index].isActive = action.payload.isActive;
                    state.questionTypes = action.payload
                }
            })
            .addCase(toggleQuestionTypeStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to toggle question type status';
            });
    },
})

export default questionTypesSlice.reducer;