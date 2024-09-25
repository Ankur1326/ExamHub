import toast from "react-hot-toast";

// Error Handler
const handleError = (error: any, rejectWithValue: any) => {
    if (error.response) {
        toast.error(error.response.data.message || "Request failed");
        console.error(`Error: ${error.response.status} - ${error.response.data}`);
        return rejectWithValue(error.response.data.message || "Request failed");
    } else if (error.request) {
        toast.error("Network error: No response from server");
        return rejectWithValue("Network error: No response from server");
    }
    return rejectWithValue(error.message || "Request failed");
};

export default handleError