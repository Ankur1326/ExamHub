let progress = 0; // Global variable to track progress

// Progress endpoint to get current upload progress
export async function GET() {
    return Response.json({ progress });
}

// Function to set the progress
export function setProgress(value: number) {
    progress = value;
}
