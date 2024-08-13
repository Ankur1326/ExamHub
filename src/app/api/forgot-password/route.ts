import { generateOTP } from "@/helpers/generateOtp";
import { sendEmail } from "@/helpers/sendEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()
    const { email, password } = await request.json();;

    try {
        if (!email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "email and password is required"
                },
                {
                    status: 409
                }
            )
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Password reset token is invalid or has expired"
                },
                {
                    status: 400
                }
            )
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return Response.json(
            {
                success: true,
                message: "Password reset successfully"
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("Error forgot password: ", error);
        return Response.json(
            {
                success: false,
                message: "Error forgot password"
            },
            {
                status: 500
            }
        )

    }
}