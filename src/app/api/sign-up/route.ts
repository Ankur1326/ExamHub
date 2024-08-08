import { generateOTP } from "@/helpers/generateOtp";
import { memoryStore } from "@/helpers/memoryStore";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password, role } = await request.json()
        console.log(username, email, password, role);
        
        const existingUserVerifiedByUsername = await User.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                { status: 400 }
            )
        }

        const existingUserByEmail = await User.findOne({ email })
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist with this email",
                }, { status: 400 })
            } else {
                existingUserByEmail.password = password
                await existingUserByEmail.save()
            }
        } else {
            const newUser = new User({
                username,
                email,
                password,
                role,
            })
            await newUser.save()
        }

        // send verification email otp
        const otp = generateOTP()
        const expiry = Date.now() + parseInt(process.env.OTP_EXPIRY || '300000', 10);

        memoryStore.push({ email, otp, expiry })
        

    } catch (error) {
        console.log("Error registring user: ", error);
        return Response.json(
            {
                success: false,
                message: "Error registring user"
            },
            {
                status: 500
            }
        )

    }
}