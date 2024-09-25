import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

// Types for the state
interface Skill {
    _id: string;
    name: string;
    shortDescription: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SkillsState {
    skills: Skill[];
    totalSkills: number;
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SkillsState = {
    skills: [],
    totalPages: 0,
    totalSkills: 0,
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

// Fetch skills with pagination
export const fetchSkills = createAsyncThunk(
    'questionSkills/fetchSkills',
    async ({ fetchAll, isActive, name, sectionName, currentPage, itemsPerPage }: { fetchAll?: boolean, isActive?: boolean | null; name?: string; sectionName?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        // console.log(name, sectionName);

        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/skills/get`, {
                params: { fetchAll, isActive, name, sectionName, currentPage, itemsPerPage }
            });
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Create a new skill thunk
export const createSkill = createAsyncThunk(
    'skills/createSkill',
    async ({ name, shortDescription, sectionName, isActive }: { name: string; shortDescription: string, sectionName: string, isActive: boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/skills/create`, { name, shortDescription, sectionName, isActive });
            toast.success(response.data.message || "Skill successfully created");

            console.log("response.data : ", response.data);
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// Edit an existing skill thunk
export const updateSkill = createAsyncThunk(
    'Skills/editSkill',
    async ({ _id, name, shortDescription, sectionName, isActive }: { _id: string, name: string; shortDescription: string; sectionName: string; isActive: boolean }, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/skills/update`, { _id, name, shortDescription, sectionName, isActive });
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

// Delete a skill thunk
export const deleteSkill = createAsyncThunk(
    'Skills/deleteSkill',
    async (_id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/skills/delete`, { data: { _id } });
            toast.success("Skills deleted successfully")
            return { _id };
        } catch (error: any) {
            console.error(error.response?.data?.message || "Failed to delete skill");
            return handleError(error, rejectWithValue);
        } finally {
            dispatch(setLoading(false));
        }
    }
);


const skillsSlice = createSlice({
    name: 'skills',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSkills.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSkills.fulfilled, (state, action: PayloadAction<{ skills: Skill[], totalPages: number, currentPage: number, totalSkills: number }>) => {
                state.status = 'succeeded';
                state.skills = action.payload.skills;
                state.totalSkills = action.payload.totalSkills;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchSkills.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch skills';
            })
            .addCase(createSkill.fulfilled, (state, action: PayloadAction<Skill>) => {
                state.skills.push(action.payload);
            })
            .addCase(createSkill.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create skill';
            })
            .addCase(updateSkill.fulfilled, (state, action: PayloadAction<Skill>) => {
                const index = state.skills.findIndex(skill => skill._id == action.payload._id);
                if (index !== -1) {
                    state.skills[index] = action.payload;
                }
            })
            .addCase(updateSkill.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to edit skill';
            })
            .addCase(deleteSkill.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.skills = state.skills.filter(skill => skill._id !== action.payload._id);
            })
            .addCase(deleteSkill.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete skill';
            });
    },
});

export default skillsSlice.reducer;
