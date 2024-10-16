import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
// import { getSession } from "next-auth/react";

export async function PUT(request: Request) {
    await dbConnect();

    // const session = await getSession({ request })

    // if (!session) {
    //     return Response.json(
    //         {
    //             success: false,
    //             message: "Unauthorized. Please log in."
    //         },
    //         {
    //             status: 401
    //         }
    //     );
    // }

    // Check if the user has admin role
    // if (session.user?.role !== "admin") {
    //     return res.status(403).json({ error: "Forbidden. You do not have permission to perform this action." });
    // }

    try {
        const { _id, role, isApproved } = await request.json();
        const userId = _id;
        console.log(_id, role, isApproved);
        

        if (!userId) {
            return Response.json(
                {
                    success: false,
                    message: "userId is required",
                },
                {
                    status: 400,
                }
            );
        }

        const prevoiusUser = await UserModel.findById({ _id: userId })
        if (!prevoiusUser) {
            return Response.json(
                {
                    success: false,
                    message: "User is not found",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isApproved,
                role
            },
            { new: true, runValidators: true }
        );

        // console.log("updatedUser : ", updatedUser);

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User updated successfully",
                data: updatedUser
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while updating user : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while user",
                error
            },
            {
                status: 500
            }
        );
    }
}