import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

// Types for the state
interface Section {
    _id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SectionsState {
    sections: Section[];
    totalSections: number;
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SectionsState = {
    sections: [],
    totalPages: 0,
    totalSections: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
};

// Error Handler
const handleError = (error: any, rejectWithValue: any) => {
    if (error.response) {
        toast.error(error.response.data.message || "Falied")
        console.log(`Error: ${error.response.status} - ${error.response.data}`);
        return rejectWithValue(error.response.data.message || "Request failed");
    } else if (error.request) {
        toast.error("Failed")
        return rejectWithValue("Network error: No response from server");
    }
    return rejectWithValue(error.message || "Request failed");
};

// Fetch sections with pagination
export const fetchSections = createAsyncThunk(
    'questionSections/fetchSections',
    async ({ isActive, name, currentPage, itemsPerPage }: { isActive?: boolean | null; name?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/sections/get`, {
                params: { isActive, name, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new section thunk
export const createSection = createAsyncThunk(
    'questionSections/createSection',
    async ({ name, shortDescription, isActive }: { name: string; shortDescription: string, isActive: boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/sections/create`, { name, shortDescription, isActive });
            toast.success(response.data.message || "Section successfully created");
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);


// Edit an existing section thunk
export const updateSection = createAsyncThunk(
    'questionSections/editSection',
    async (section: Section, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/sections/update`, section);
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

// Delete a section thunk
export const deleteSection = createAsyncThunk(
    'questionSections/deleteSection',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/sections/delete`, { data: { _id } });
            toast.success("Sections deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete section");
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);


const sectionsSlice = createSlice({
    name: 'sections',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSections.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSections.fulfilled, (state, action: PayloadAction<{ sections: Section[], totalPages: number, currentPage: number, totalSections: number }>) => {
                state.status = 'succeeded';
                state.sections = action.payload.sections;
                state.totalSections = action.payload.totalSections;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch sections';
            })
            .addCase(createSection.fulfilled, (state, action: PayloadAction<Section>) => {
                state.sections.push(action.payload);
            })
            .addCase(createSection.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create section';
            })
            .addCase(updateSection.fulfilled, (state, action: PayloadAction<Section>) => {
                const index = state.sections.findIndex(section => section._id == action.payload._id);
                if (index !== -1) {
                    state.sections[index] = action.payload;
                }
            })
            .addCase(updateSection.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit section';
            })
            .addCase(deleteSection.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.sections = state.sections.filter(section => section._id !== action.payload._id);
            })
            .addCase(deleteSection.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete section';
            });
    },
});

export default sectionsSlice.reducer;
