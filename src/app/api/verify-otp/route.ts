import dbConnect from '@/lib/dbConnect';
import User from '@/model/User';

// Verify OTP
export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return Response.json(
                {
                    success: false,
                    message: "Email and OTP are required"
                },
                {
                    status: 400
                }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        if (
            user.resetPasswordToken !== otp ||
            !user.resetPasswordExpires ||  // Check if resetPasswordExpires is undefined
            user.resetPasswordExpires.getTime() < new Date().getTime()
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid or expired OTP"
                },
                {
                    status: 400
                }
            );
        }

        // // Clear OTP fields after successful verification
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpires = undefined;
        // await user.save();

        return Response.json(
            {
                success: true,
                message: "OTP verified successfully"
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error verifying OTP: ", error);
        return Response.json(
            {
                success: false,
                message: "Error verifying OTP"
            },
            {
                status: 500
            }
        );
    }
}

