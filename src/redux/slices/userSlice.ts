import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { setLoading } from "./loadingSlice";
import nProgress from "nprogress";

// Types for the state
interface UserProfile {
    username?: string;
    email?: string;
    [key: string]: any; // For additional fields
}

interface ProfileState {
    profile: UserProfile | null;
    profilePicture: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    isUploading: boolean;
    error: string | null;
}

// Initial state
const initialState: ProfileState = {
    profile: null,
    profilePicture: null,
    status: 'idle',
    isUploading: false,
    error: null,
};

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk<UserProfile, { username: string; email: string }, { rejectValue: any }>(
    'user/fetchUserProfile',
    async ({ username, email }, { rejectWithValue }) => {
        try {
            nProgress.start();
            const response = await fetch(`/api/profile/get?username=${username}&email=${email}`);
            if (!response.ok) {
                return rejectWithValue(await response.json());
            }

            return await response.json();
        } catch (error: any) {
            console.error(error);
            return rejectWithValue({ message: 'Failed to fetch user profile', error: error?.message });
        } finally {
            nProgress.done();
        }
    }
);

// Upload profile picture thunk
export const uploadProfilePicture = createAsyncThunk<string, File, { rejectValue: string }>(
    'profile/uploadProfilePicture',
    async (file, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true));
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/image-upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                toast.error("Failed to upload image");
                throw new Error('Failed to upload image');
            }

            toast.success("Image uploaded successfully");
            const data = await response.json();
            return data.secureUrl;
        } catch (error: any) {
            console.log("Error while uploading profile image : ", error);
            return rejectWithValue(error.message);
        } finally {
            nProgress.done();
            dispatch(setLoading(false));
        }
    }
);

// Thunk to update user profile
export const updateUserProfile = createAsyncThunk<UserProfile, { formData: any; userId: string }, { rejectValue: string }>(
    'user/updateUserProfile',
    async ({ formData, userId }, { dispatch, rejectWithValue }) => {
        nProgress.start();
        dispatch(setLoading(true))
        try {
            const response = await fetch(`/api/profile/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData,
                    userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user profile');
            }

            toast.success("Profile updated successfully");
            return await response.json();
        } catch (error: any) {
            toast.error("Failed to update profile");
            return rejectWithValue(error.message);
        } finally {
            nProgress.done();
            dispatch(setLoading(false))
        }
    }
);


// Profile slice
const profileSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUserProfile: (state, action: PayloadAction<UserProfile>) => {
            state.profile = action.payload;
        },
        resetUploadState: (state) => {
            state.isUploading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
                state.status = 'succeeded';
                state.profilePicture = action.payload.user.profilePicture;
                state.profile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch user profile';
            })
            .addCase(uploadProfilePicture.pending, (state) => {
                state.isUploading = true;
                state.error = null;
            })
            .addCase(uploadProfilePicture.fulfilled, (state, action: PayloadAction<string>) => {
                state.isUploading = false;
                state.profilePicture = action.payload; // Update the profile picture in the profile
            })
            .addCase(uploadProfilePicture.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isUploading = false;
                state.error = action.payload || 'Failed to upload profile picture';
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
                state.status = 'succeeded';
                state.profile = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to update user profile';
            });
    },
});

export const { resetUploadState } = profileSlice.actions;
export default profileSlice.reducer;