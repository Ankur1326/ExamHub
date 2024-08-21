import dbConnect from "@/lib/dbConnect";
import UserModel from '@/model/User';

export async function GET(request: Response) {
    await dbConnect();

    try {
        const { username, email } = await request.json()
        if (!username || !email) {
            return Response.json(
                {
                    success: false,
                    message: "username and email are required"
                },
                {
                    status: 409
                }
            )
        }

        const user = await UserModel.findOne({
            username, email
        })

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

        return Response.json(
            {
                success: true,
                message: "User successfully fetched"
            },
            { status: 200 }
        )

    } catch (error) {
        console.log("Error while fetching user profile: ", error);
        return Response.json(
            {
                success: false,
                message: "Error fetching user profile"
            },
            {
                status: 500
            }
        );
    }
}