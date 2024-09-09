import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

// Types for the state
interface Tag {
    _id: string;
    name: string;
    isActive: boolean;
}

interface TagsState {
    tags: Tag[];
    totalPages: number;
    totalTags: number;
    currentPage: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial state
const initialState: TagsState = {
    tags: [],
    totalPages: 0,
    totalTags: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
};

// Fetch tags with pagination
export const fetchTags = createAsyncThunk<
    { tags: Tag[], totalPages: number, currentPage: number, totalTags: number },
    { isActive?: boolean, currentPage: number, tagsPerPage: number },
    { rejectValue: string }
>(
    'questionTags/fetchQuestionTags',
    async ({ isActive, currentPage, tagsPerPage }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/tages/get`, {
                params: { page: currentPage, tagsPerPage: tagsPerPage, isActive }
            });
            return {
                tags: response.data.data,
                totalTags: response.data.pagination.totalTags,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPage,
            };
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Toggle question type status thunk
export const toggleTagStatus = createAsyncThunk<Tag, { id: string }, { rejectValue: string }>(
    'questionTags/toggleQuestionTagStatus',
    async ({ id }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/configuration/manage-categoriesAndTages/tages/toggle-status`, { id });
            return response.data.data;
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing tag thunk
export const editTag = createAsyncThunk<Tag, { id: string, tagName: string, isActive: boolean }, { rejectValue: string }>(
    'questionTags/editTag',
    async ({ id, tagName, isActive }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.patch(`/api/admin/tages/update`, { tagId: id, tagName, isActive });

            return response.data.data;
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new tag thunk
export const createTag = createAsyncThunk<Tag, { tagName: string, isActive: boolean }, { rejectValue: string }>(
    'questionTags/createTag',
    async ({ tagName, isActive }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/tages/create`, { tagName, isActive });

            return response.data.data;
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 409) {
                toast.error("Tag is already exist")
                return rejectWithValue("Tag already exists.");
            }
            return rejectWithValue(error.message || "Failed to create tag");
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Delete a tag thunk
export const deleteTag = createAsyncThunk<{ _id: string }, { _id: string }, { rejectValue: string }>(
    'questionTags/deleteTag',
    async ({ _id }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/tages/delete`, { data: { _id } });
            return { _id };
        } catch (error: any) {
            console.error(error);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

const questionTypesSlice = createSlice({
    name: 'questionTypes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTags.fulfilled, (state, action: PayloadAction<{ tags: Tag[], totalPages: number, currentPage: number, totalTags: number }>) => {
                state.status = 'succeeded';
                state.tags = action.payload.tags;
                state.totalTags = action.payload.totalTags;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchTags.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch question tags';
            })
            .addCase(toggleTagStatus.fulfilled, (state, action: PayloadAction<Tag>) => {
                const index = state.tags.findIndex(tag => tag._id === action.payload._id);
                if (index !== -1) {
                    state.tags[index].isActive = action.payload.isActive;
                }
            })
            .addCase(toggleTagStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to toggle tag status';
            })
            .addCase(createTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                state.tags.unshift(action.payload);

            })
            .addCase(createTag.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to create tag';
            })
            .addCase(editTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                const index = state.tags.findIndex(tag => tag._id == action.payload._id);
                if (index !== -1) {
                    state.tags[index] = action.payload; // Update the tag with new data
                }
            })
            .addCase(editTag.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to edit tag';
            })
            .addCase(deleteTag.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.tags = state.tags.filter(tag => tag._id !== action.payload._id);
            })
            .addCase(deleteTag.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to delete tag';
            });
    },
});

export default questionTypesSlice.reducer;
