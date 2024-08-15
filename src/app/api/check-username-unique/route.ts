import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from 'zod'

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        username: searchParams.get('username') || ""
        const queryParams = {

        }
        const result = usernameQuerySchema.safeParse(queryParams)
        // validate with zod

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(",")
                    : "invalid query parameter",
            }, { status: 400 })
        }

        const { username } = result.data
        const existingVerifiedUser = await User.findOne({ username, isVerified: true })
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "username is not available",
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: "username is available",
        }, { status: 200 })

    } catch (error) {
        console.log("Error while checking username", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}