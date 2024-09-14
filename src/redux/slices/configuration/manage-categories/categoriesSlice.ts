import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setLoading } from "../../loadingSlice";
import toast from "react-hot-toast";

interface Category {
    _id: string;
    name: string;
    description: string;
    content: string;
    isActive: boolean | null;
    createdAt: string;
    updatedAt: string;
}

interface CategoriesState {
    categories: Category[];
    totalCategories: number;
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CategoriesState = {
    categories: [],
    totalCategories: 0,
    currentPage: 1,
    totalPages: 0,
    status: 'idle',
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async ({ isActive, name, currentPage, itemsPerPage }: { isActive?: boolean | null; name?: string; currentPage?: number; itemsPerPage?: number }, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.get('/api/admin/categories/get', {
                params: { isActive, name, currentPage, itemsPerPage },
            });

            return {
                categories: response.data.data.categories,
                totalCategories: response.data.data.totalCategories,
                currentPage: response.data.data.currentPage,
                totalPages: response.data.data.totalPages,
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetched categories');
        } finally {
            dispatch(setLoading(false))
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.post('/api/admin/categories/create', category);
            if (response.status === 200) {
                toast.success(response.data.message || "Successfully created category")
                return response.data.data;
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed")
            return rejectWithValue(error.message || 'Failed to create category');
        } finally {
            dispatch(setLoading(false))
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async (category: Category, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.put(`/api/admin/categories/update`, category);
            // console.log("response : ", response);
            if (response.status === 200) {
                toast.success(response.data.message || "updated successfully")
                return response.data.data;
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to update category")
            return rejectWithValue(error.message || 'Failed to update category');
        } finally {
            dispatch(setLoading(false))
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (_id: string, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true))
            const response = await axios.delete(`/api/admin/categories/delete`, { data: { _id } });
            toast.success("Category deleted successfully")
            return { _id };
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete category")
            return rejectWithValue(error?.response?.data?.message || 'Failed to delete category');
        } finally {
            dispatch(setLoading(false))
        }
    }
);


const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<any>) => {
                const { categories, totalCategories, currentPage, totalPages } = action.payload;
                state.status = 'succeeded';
                state.categories = categories;
                state.totalCategories = totalCategories;
                state.currentPage = currentPage;
                state.totalPages = totalPages;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch categories';
            })
            .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to create category';
            })
            .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                const index = state.categories.findIndex((cat) => cat._id === action.payload._id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update category';
            })
            .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.categories = state.categories.filter((cat) => cat._id !== action.payload._id);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete category';
            });
    },
});

export default categoriesSlice.reducer