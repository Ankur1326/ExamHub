import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { z } from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()

        const verifyCode = code.join("")

        if (!username || !code) {
            return Response.json(
                {
                    success: false,
                    message: "username and otp is reqired"
                },
                { status: 409 }
            )
        }
        const decodedUsername = decodeURIComponent(username)
        console.log('decodedUsername : ', decodedUsername);

        const user = await User.findOne({ username: decodedUsername })
        console.log('user : ', user);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 409 }
            )
        }

        // now to compare otp
        const isCodeValid = user.verifyCode === verifyCode;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeNotExpired && isCodeValid) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "user is verified",
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            // if code date is expired
            return Response.json(
                {
                    success: false,
                    message: "code is expired please sign up again to verify code",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "code is incorrect please fill it carefully",
                },
                { status: 400 }
            )
        }

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