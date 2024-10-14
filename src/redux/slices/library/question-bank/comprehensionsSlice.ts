import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";
import handleError from "../../handleError";
import nProgress from "nprogress";

interface Comprehension {
    _id: string;
    title: string;
    body: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ComprehensionsState {
    comprehensions: Comprehension[];
    totalComprehensions: number;
    currentPage?: number;
    totalPages?: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ComprehensionsState = {
    comprehensions: [],
    totalPages: 0,
    totalComprehensions: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
};

// Fetch comprehensions with pagination
export const fetchComprehensions = createAsyncThunk(
    'Comprehension/fetchComprehensions',
    async ({ fetchAll, isActive, title, currentPage, itemsPerPage }: { fetchAll?: boolean | null, isActive?: boolean | null; title?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/comprehensions/get`, {
                params: { fetchAll, isActive, title, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Create a new item thunk
export const createComprehension = createAsyncThunk(
    'comprehension/createComprehension',
    async ({ title, body, isActive }: { title: string; body: string, isActive: boolean }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/comprehensions/create`, { title, body, isActive });
            toast.success(response.data.message || "Comprehension successfully created");

            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing item thunk
export const updateComprehension = createAsyncThunk(
    'comprehension/editComprehension',
    async (comprehension: Comprehension, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/comprehension/update`, comprehension);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Delete a item thunk
export const deleteComprehension = createAsyncThunk(
    'comprehension/deleteComprehension',
    async (_id: string, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/comprehensions/delete`, { data: { _id } });
            toast.success("Comprehensions deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete comprehension");
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

const comprehensionsSlice = createSlice({
    name: 'comprehensions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComprehensions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchComprehensions.fulfilled, (state, action: PayloadAction<{ comprehensions: Comprehension[], totalPages: number, currentPage: number, totalComprehensions: number }>) => {
                state.status = 'succeeded';
                state.comprehensions = action.payload.comprehensions;
                state.totalComprehensions = action.payload.totalComprehensions;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchComprehensions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch comprehensions';
            })
            .addCase(createComprehension.fulfilled, (state, action: PayloadAction<Comprehension>) => {
                state.comprehensions.push(action.payload);
            })
            .addCase(createComprehension.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create comprehension';
            })
            .addCase(updateComprehension.fulfilled, (state, action: PayloadAction<Comprehension>) => {
                const index = state.comprehensions.findIndex(com => com._id == action.payload._id);
                if (index !== -1) {
                    state.comprehensions[index] = action.payload;
                }
            })
            .addCase(updateComprehension.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit comprehension';
            })
            .addCase(deleteComprehension.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.comprehensions = state.comprehensions.filter(com => com._id !== action.payload._id);
            })
            .addCase(deleteComprehension.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete comprehension';
            });
    },
});

export default comprehensionsSlice.reducer;