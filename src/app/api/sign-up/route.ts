import { generateOTP } from "@/helpers/generateOtp";
import { sendEmail } from "@/helpers/sendEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password, role } = await request.json()
        // console.log(username, email, password, role);

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        const verifyCode = generateOTP()

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                { status: 400 }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exist with this email",
                }, { status: 400 })
            } else {
                existingUserByEmail.password = password
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        } else {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password,
                role,
                verifyCode,
                verifyCodeExpiry: expiryDate,
            })
            console.log(newUser);
            
            await newUser.save()
        }

        const response = await sendEmail(email, "OTP for verifing email", { otp: verifyCode })
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