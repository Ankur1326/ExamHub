import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await User.findOne({ username: decodedUsername })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 409 }
            )
        }
        const isCodeValid = user.isVerified

    } catch (error) {
        console.log("Error while verifying user", error);
        return Response.json(
            {
                success: false,
                message: "Error while verifying user"
            },
            { status: 500 }
        )
    }
}