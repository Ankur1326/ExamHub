import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";
import nProgress from "nprogress";
import handleError from "../../handleError";

// Types for the state
interface User {
    _id: string;
    username: string;
    fullName: string
    email: string;
    role: string;
    isActive: boolean;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    profilePicture: string;
}

interface UsersState {
    users: User[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    totalPages: 0,
    totalUsers: 0,
    currentPage: 1,
    status: 'idle',
    error: null,
};

// Fetch users with pagination
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async ({ currentPage, itemsPerPage }: { isActive?: boolean; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.get(`/api/admin/users/get/`, {
                params: { currentPage, itemsPerPage }
            });
            console.log("response : ", response);

            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Create a new user thunk
export const createUser = createAsyncThunk(
    'users/createUser',
    async ({ username, email, role, isActive }: { username: string; email: string; role: string; isActive: boolean }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.post(`/api/admin/users/create`, { username, email, role, isActive });
            toast.success(response.data.message || "User successfully created");

            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Update an existing user thunk
export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ _id, isApproved, role }: { _id: string; isApproved: boolean; role: string; isActive: boolean }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/users/update`, { _id, isApproved, role });
            console.log("response :: ", response);
            
            if (response.status === 200) {
                toast.success("Successfully updated");
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

// Approve a user thunk
export const approveUser = createAsyncThunk(
    'users/approveUser',
    async (_id: string, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            const response = await axios.put(`/api/admin/users/approve`, { _id });
            toast.success("User approved successfully");
            return response.data.data;
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Delete a user thunk
export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (_id: string, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/admin/users/delete`, { data: { _id } });
            toast.success("User deleted successfully");
            return { _id };
        } catch (error: any) {
            return handleError(error, rejectWithValue);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[], totalPages: number, currentPage: number, totalUsers: number }>) => {
                state.status = 'succeeded';
                state.users = action.payload.users;
                state.totalUsers = action.payload.totalUsers;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string || 'Failed to fetch users';
            })
            .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload as string || 'Failed to create user';
            })
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update user';
            })
            .addCase(approveUser.fulfilled, (state, action: PayloadAction<User>) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index].isApproved = true;
                }
            })
            .addCase(approveUser.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to approve user';
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.users = state.users.filter(user => user._id !== action.payload._id);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete user';
            });
    },
});

export default usersSlice.reducer;
