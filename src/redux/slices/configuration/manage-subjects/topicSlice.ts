import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

// Types for the state
interface Topic {
    _id: string;
    name: string;
    shortDescription: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TopicsState {
    topics: Topic[];
    totalTopics: number;
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TopicsState = {
    topics: [],
    totalPages: 0,
    totalTopics: 0,
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

// Fetch topics with pagination
export const fetchTopics = createAsyncThunk(
    'Topics/fetchTopics',
    async ({ isActive, name, skillName, currentPage, itemsPerPage }: { isActive?: boolean | null; name?: string; skillName?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/topics/get`, {
                params: { isActive, name, skillName, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new topic thunk
export const createTopic = createAsyncThunk(
    'topics/createTopic',
    async ({ name, shortDescription, skillName, isActive }: { name: string; shortDescription: string, skillName: string, isActive: boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/topics/create`, { name, shortDescription, skillName, isActive });
            toast.success(response.data.message || "Topics successfully created");
            
            // console.log("response.data : ", response.data);
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing topic thunk
export const updateTopic = createAsyncThunk(
    'Topics/editTopic',
    async ({ _id, name, shortDescription, skillName, isActive }: { _id:string, name:string; shortDescription:string; skillName:string; isActive:boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/topics/update`, { _id, name, shortDescription, skillName, isActive });
            if (response.status === 200) {
                toast.success("Successfully updated")
                return response.data.data;
            }
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Delete a topic thunk
export const deleteTopic = createAsyncThunk(
    'Topics/deleteTopic',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/topics/delete`, { data: { _id } });
            toast.success("Topics deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete Topics");
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);


const topicSlice = createSlice({
    name: 'topics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTopics.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTopics.fulfilled, (state, action: PayloadAction<{ topics: Topic[], totalPages: number, currentPage: number, totalTopics: number }>) => {
                state.status = 'succeeded';
                state.topics = action.payload.topics;
                state.totalTopics = action.payload.totalTopics;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchTopics.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch skills';
            })
            .addCase(createTopic.fulfilled, (state, action: PayloadAction<Topic>) => {
                state.topics.push(action.payload);
            })
            .addCase(createTopic.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create skill';
            })
            .addCase(updateTopic.fulfilled, (state, action: PayloadAction<Topic>) => {
                const index = state.topics.findIndex(topic => topic._id == action.payload._id);
                if (index !== -1) {
                    state.topics[index] = action.payload;
                }
            })
            .addCase(updateTopic.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit skill';
            })
            .addCase(deleteTopic.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.topics = state.topics.filter(topic => topic._id !== action.payload._id);
            })
            .addCase(deleteTopic.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete skill';
            });
    },
});

export default topicSlice.reducer;
