import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import handleError from "../../handleError";
import { setLoading } from "../../loadingSlice";

// Structure of a Question
interface Question {
    _id?: string;
    questionType?: string;
    question?: string;
    options?: {text:string, isCorrect: boolean}[];
    pairs?: {
        left: string;
        right: string;
    }[];
    sequences?: string[];
    trueFalseAnswer?: boolean | null;
    shortAnswer?: number;
    fillInTheBlanks?: string;
    skillName?: string;
    topicName?: string;
    tagNames?: string[];
    difficultyLevel?: string;
    defaultMarks?: number;
    defaultTimeToSolve?: number;
    solution?: string;
    enableSolutionVideo?: boolean;
    solutionVideoType?: string;
    solutionVideoLink?: string;
    hint?: string;
    isActive?: boolean;
    // setp 4
    enableQuestionAttachment?: boolean
    attachmentType?: string;
    comprehensionPassageId?: string;
    selectedFormat?: string;
    audioLink?: string;
    videoType?: string;
    videoLinkOrId?: string;
}

//shape of the state
interface QuestionState {
    questions: Question[];
    totalQuestions: number;
    currentPage?: number;
    totalPages?: number;
    loading: boolean;
    error: string | null;
    stepCompleted: number | null;
}

// Initial state
const initialState: QuestionState = {
    questions: [],
    totalPages: 0,
    totalQuestions: 0,
    currentPage: 1,
    loading: false,
    error: null,
    stepCompleted: null,
};

// Payload type for async thunk
interface CreateQuestionPayload {
    step: number;
    data: Partial<Question>;
    questionId?: string | null
}

export const createOrUpdateQuestion = createAsyncThunk<
    any,
    CreateQuestionPayload,
    { rejectValue: { message: string } }
>(
    'question/createOrUpdateQuestion',
    async ({ step, data, questionId }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.post('/api/admin/question/create-or-update', {
                step,
                ...data, // Spread the data for each step
                questionId
            });

            // Show toast message on success for each step
            if (response.data.success) {
                toast.success(response.data.message)
            }
            console.log("response : ", response);
            return response.data;

        } catch (error: any) {
            handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

// Fetch questions with pagination
export const fetchQuestions = createAsyncThunk<
    { questions: Question[], totalPages: number, totalQuestions: number, currentPage: number },
    { fetchAll?: boolean, questionCode?: string, question?: string, questionType?: string, section?: string, skill?: string, topic?: string, isActive?: boolean | null, currentPage?: number; itemsPerPage?: number },
    { rejectValue: { message: string } }
>(
    'question/fetchQuestions',
    async ({ questionCode, question, questionType, section, skill, topic, isActive, currentPage = 1, itemsPerPage = 10 }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.get('/api/admin/question/get', {
                params: { questionCode, question, questionType, section, skill, topic, isActive, currentPage, itemsPerPage },
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false))
        }
    }
);

export const deleteQuestion = createAsyncThunk(
    'question/deleteQuestion',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true))
        try {
            await axios.delete(`/api/admin/question/delete`, { data: { _id } });
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete question");
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
)

const questionSlice = createSlice({
    name: 'question',
    initialState,
    reducers: {
        resetQuestionState: (state) => {
            state.questions = [];
            state.loading = false;
            state.error = null;
            state.stepCompleted = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrUpdateQuestion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrUpdateQuestion.fulfilled, (state, action) => {
                state.loading = false;
                state.stepCompleted = action.meta.arg.step;
            })
            .addCase(createOrUpdateQuestion.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload.message || 'Failed to create or update question';
            })
            // Handle fetchQuestions with pagination
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<{ questions: Question[], totalPages: number, totalQuestions: number, currentPage: number }>) => {
                state.loading = false;
                state.questions = action.payload.questions;
                state.totalQuestions = action.payload.totalQuestions;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch questions';
            })
            .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.questions = state.questions.filter(que => que._id !== action.payload._id)
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.error = action.error.message || "Failed to delete question"
            })
    },
});

export default questionSlice.reducer;