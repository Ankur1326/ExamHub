import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

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
    'questionTags/fetchQuestionTags',
    async ({ isActive, name, currentPage, itemsPerPage }: { isActive?: boolean | null; name?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/tages/get`, {
                params: { isActive, name, currentPage, itemsPerPage }
            });
            return {
                tags: response.data.data.tags,
                totalTags: response.data.data.totalTags,
                currentPage: response.data.data.currentPage,
                totalPages: response.data.data.totalPages,
            };
        } catch (error: any) {

            if (error.response) {
                // Server responded with a status other than 2xx
                console.log(`Error: ${error.response.status} - ${error.response.data}`);
                console.log("error.response.data : ", error.response.data);

            } else if (error.request) {
                // Request was made but no response was received
                console.log('Network error: No response from server');
            } else {
                // Something else happened in setting up the request
                console.log(`Error: ${error.message}`);
            }

            console.error("error : ", error);
            console.error("error.message : ", error.message);
            return rejectWithValue(error.message);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new tag thunk
export const createTag = createAsyncThunk<Tag, { name: string, isActive: boolean }, { rejectValue: string }>(
    'questionTags/createTag',
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
export const updateTag = createAsyncThunk(
    'questionTags/editTag',
    async (tag: Tag, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/tages/update`, tag);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error: any) {
            console.error(error.response.data.message || "Failed to update tag");
            return rejectWithValue(error.message || 'Failed to update tag');
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Delete a tag thunk
export const deleteTag = createAsyncThunk(
    'questionTags/deleteTag',
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
                state.tags.unshift(action.payload);

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
