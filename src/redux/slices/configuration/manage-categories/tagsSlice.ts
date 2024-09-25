import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";
import handleError from "../../handleError";

// Types for the state
interface Tag {
    _id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TagsState {
    tags: Tag[];
    totalTags: number;
    currentPage: number;
    totalPages: number;
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
export const fetchTags = createAsyncThunk(
    'Tags/fetchTags',
    async ({ fetchAll, isActive, name, currentPage, itemsPerPage }: { fetchAll?: boolean; isActive?: boolean | null; name?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/tages/get`, {
                params: { fetchAll, isActive, name, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue)
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new tag thunk
export const createTag = createAsyncThunk<Tag, { name: string, isActive: boolean }, { rejectValue: string }>(
    'Tags/createTag',
    async ({ name, isActive }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/tages/create`, { name, isActive });
            if (response.status === 200) {
                toast.success(response.data.message || "Tag successfully created")
                return response.data.data;
            }
        } catch (error: any) {
            console.error(error);
            return handleError(error, rejectWithValue)
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Toggle question type status thunk
export const toggleTagStatus = createAsyncThunk<Tag, { id: string }, { rejectValue: string }>(
    'Tags/toggleQuestionTagStatus',
    async ({ id }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/configuration/manage-categoriesAndTages/tages/toggle-status`, { id });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue)
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing tag thunk
export const updateTag = createAsyncThunk(
    'Tags/editTag',
    async (tag: Tag, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/tages/update`, tag);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error: any) {
            return handleError(error, rejectWithValue)
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Delete a tag thunk
export const deleteTag = createAsyncThunk(
    'Tags/deleteTag',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/tages/delete`, { data: { _id } });
            toast.success("Tag deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete tag");
            return rejectWithValue(error.response?.data?.message || 'Failed to delete tag');
        } finally {
            dispatch(setLoading(false));
        }
    }
);

const tagsSlice = createSlice({
    name: 'tags',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTags.fulfilled, (state, action: PayloadAction<{ tags: Tag[], totalPages: number, currentPage: number, totalTags: number }>) => {
                const { tags, totalTags, currentPage, totalPages } = action.payload;
                state.status = 'succeeded';
                state.tags = tags;
                state.totalTags = totalTags;
                state.currentPage = currentPage;
                state.totalPages = totalPages;
            })
            .addCase(fetchTags.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch tags';
            })
            .addCase(toggleTagStatus.fulfilled, (state, action: PayloadAction<Tag>) => {
                state.tags.push(action.payload);
            })
            .addCase(toggleTagStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to toggle tag status';
            })
            .addCase(createTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                state.tags.push(action.payload);

            })
            .addCase(createTag.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload || 'Failed to create tag';
            })
            .addCase(updateTag.fulfilled, (state, action: PayloadAction<Tag>) => {
                const index = state.tags.findIndex(tag => tag._id == action.payload._id);
                if (index !== -1) {
                    state.tags[index] = action.payload; // Update the tag with new data
                }
            })
            .addCase(updateTag.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit tag';
            })
            .addCase(deleteTag.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.tags = state.tags.filter(tag => tag._id !== action.payload._id);
            })
            .addCase(deleteTag.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete tag';
            });
    },
});

export default tagsSlice.reducer;
