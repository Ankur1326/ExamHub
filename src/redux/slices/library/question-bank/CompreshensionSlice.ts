import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";
import handleError from "../../handleError";

interface Compreshension {
    _id: string;
    title: string;
    body: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CompreshensionsState {
    compreshensions: Compreshension[];
    totalCompreshensions: number;
    currentPage?: number;
    totalPages?: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CompreshensionsState = {
    compreshensions: [],
    totalPages: 0,
    totalCompreshensions: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
};

// Fetch compreshensions with pagination
export const fetchCompreshensions = createAsyncThunk(
    'Compreshension/fetchCompreshensions',
    async ({ fetchAll, isActive, title, currentPage, itemsPerPage }: { fetchAll?: boolean | null, isActive?: boolean | null; title?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/compreshensions/get`, {
                params: { fetchAll, isActive, title, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new item thunk
export const createCompreshension = createAsyncThunk(
    'compreshension/createCompreshension',
    async ({ title, body, isActive }: { title: string; body: string, isActive: boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/compreshensions/create`, { title, body, isActive });
            toast.success(response.data.message || "Compreshension successfully created");

            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing item thunk
export const updateCompreshension = createAsyncThunk(
    'compreshension/editCompreshension',
    async (compreshension: Compreshension, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/compreshension/update`, compreshension);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Delete a item thunk
export const deleteCompreshension = createAsyncThunk(
    'compreshension/deleteCompreshension',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/compreshensions/delete`, { data: { _id } });
            toast.success("Compreshensions deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete compreshension");
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);


const compreshensionsSlice = createSlice({
    name: 'compreshensions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompreshensions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCompreshensions.fulfilled, (state, action: PayloadAction<{ compreshensions: Compreshension[], totalPages: number, currentPage: number, totalCompreshensions: number }>) => {
                state.status = 'succeeded';
                state.compreshensions = action.payload.compreshensions;
                state.totalCompreshensions = action.payload.totalCompreshensions;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchCompreshensions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch compreshensions';
            })
            .addCase(createCompreshension.fulfilled, (state, action: PayloadAction<Compreshension>) => {
                state.compreshensions.push(action.payload);
            })
            .addCase(createCompreshension.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create compreshension';
            })
            .addCase(updateCompreshension.fulfilled, (state, action: PayloadAction<Compreshension>) => {
                const index = state.compreshensions.findIndex(com => com._id == action.payload._id);
                if (index !== -1) {
                    state.compreshensions[index] = action.payload;
                }
            })
            .addCase(updateCompreshension.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit compreshension';
            })
            .addCase(deleteCompreshension.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.compreshensions = state.compreshensions.filter(com => com._id !== action.payload._id);
            })
            .addCase(deleteCompreshension.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete compreshension';
            });
    },
});

export default compreshensionsSlice.reducer;