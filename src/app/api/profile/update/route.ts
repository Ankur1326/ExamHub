import dbConnect from "@/lib/dbConnect";
import UserModel from '@/model/User';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { formData, userId } = await request.json()
        // console.log(formData, userId);

        // console.log("formData.additionalFields : " , formData.additionalFields);

        if (!userId) {
            return Response.json(
                {
                    success: false,
                    message: "User ID and is required"
                },
                {
                    status: 400
                }
            );
        }
        
        // Find the user by ID and update their profile
        const user = await UserModel.findById(userId);
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
        
        // Update user fields
        user.fullName = formData.fullName || user.fullName;
        user.mobileNum = formData.mobileNum || user.mobileNum;
        user.username = formData.username || user.username;
        user.address = formData.address || user.address;
        user.dateOfBirth = formData.dateOfBirth || user.dateOfBirth;
        user.gender = formData.gender || user.gender;
        // user.gender = formData.additionalFields
        
        // Save the updated user document
        await user.save();
        
        return Response.json(
            {
                success: true,
                message: "Profile updated successfully",
                user
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Internal server error while updating user profile: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while updating user profile"
            },
            {
                status: 500
            }
        );
    }
}