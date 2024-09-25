import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import handleError from "../../handleError";
import toast from "react-hot-toast";

// Types for the state
interface QuestionType {
    name?: string;
    shortDescription?: string;
    code?: string;
    _id?: string;
    isActive: boolean;
    defaultTimeToSolve: Number;
    defaultMarks: Number;
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

export const fetchQuestionTypes = createAsyncThunk(
    'questionTypes/fetchQuestionTypes',
    async ({ isActive }: { isActive?: boolean | null; }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            const response = await axios.get('/api/admin/question-types/get', {
                params: { isActive }
            });
            return response.data.data || []
        } catch (error: any) {
            if (error.response.data.message === "Configration is not found") {
                return rejectWithValue("Configration is not found")
            } else if (error.response.data.message === "Question types is not found") {
                return rejectWithValue("Question types is not found")
            }
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

export const addAllQuestionTypes = createAsyncThunk<QuestionType[], void, { rejectValue: string }>(
    'questionTypes/addAllQuestionType',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            const response = await axios.post('/api/admin/question-types/add-all');
            // console.log("response : ", response);
            return response.data.data || [];
        } catch (error: any) {
            console.error("error : ", error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

// Edit a specific question type
export const updateQuestionType = createAsyncThunk<QuestionType, QuestionType, { rejectValue: string }>(
    'questionTypes/editQuestionType',
    async (data, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            const response = await axios.put(`/api/admin/question-types/update`, data);

            if (response.status !== 200) {
                return rejectWithValue('Failed to update question type');
            }

            if (response.status === 200) {
                toast.success("Successessfully Updated")
            }
            return response.data.data;
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

// Toggle question type status thunk
export const toggleQuestionTypeStatus = createAsyncThunk<QuestionType, { _id: string }, { rejectValue: string }>(
    'questionTypes/toggleQuestionTypeStatus',
    async ({ _id }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            const response = await axios.post(`/api/admin/question-types/toggle-status`, { _id });

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
            .addCase(fetchQuestionTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch question types';
            })
            .addCase(addAllQuestionTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addAllQuestionTypes.fulfilled, (state, action: PayloadAction<QuestionType[]>) => {
                state.status = 'succeeded';
                state.questionTypes = action.payload;
                state.error = null
            })
            .addCase(addAllQuestionTypes.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to add question types';
            })
            .addCase(updateQuestionType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateQuestionType.fulfilled, (state, action: PayloadAction<QuestionType>) => {
                state.status = 'succeeded';
                const index = state.questionTypes.findIndex(qt => qt._id === action.payload._id);
                if (index !== -1) {
                    state.questionTypes[index] = action.payload;
                }
            })
            .addCase(updateQuestionType.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to update question type';
            })
            .addCase(toggleQuestionTypeStatus.fulfilled, (state, action: any) => {
                const index = state.questionTypes.findIndex(type => type._id === action.payload._id);
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