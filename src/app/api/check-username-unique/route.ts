import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod';

const usernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);

        // Correctly assign the username to queryParams
        const queryParams = {
            username: searchParams.get('username')
        };

        // Validate with zod
        const result = usernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return new Response(
                JSON.stringify({
                    success: false,
                    message: usernameErrors.length > 0
                        ? usernameErrors.join(",")
                        : "Invalid query parameter",
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Username is not available",
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Username is available",
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error("Error while checking username", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error checking username",
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}