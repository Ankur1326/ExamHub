import { generateOTP } from "@/helpers/generateOtp";
import { sendEmail } from "@/helpers/sendEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

// send otp
export async function POST(request: Request) {
    await dbConnect()

    try {
        const { email, type } = await request.json()

        if (!email) {
            return Response.json(
                {
                    success: false,
                    message: "email is required"
                },
                {
                    status: 400
                }
            )
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        const otp = generateOTP();
        const resetTokenExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY || "", 10)); // 5 min

        user.resetPasswordToken = otp;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const response = await sendEmail(email, type, { otp })
        // console.log("response : ", response);
        if (response) {
            return Response.json(
                {
                    success: true,
                    message: "Email send successfully"
                },
                {
                    status: 200
                }
            )
        }

    } catch (error) {
        console.log("Error sending otp: ", error);
        return Response.json(
            {
                success: false,
                message: "Error sending otp"
            },
            {
                status: 500
            }
        )

    }
}
