import dbConnect from "@/lib/dbConnect";
import Tag from "@/model/Tags";
// import { getSession } from "next-auth/react";

export async function DELETE(request: Request) {
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
        const data = await request.json();
        const tagId = data._id


        // Fixing validation to check for undefined for isActive
        if (!tagId) {
            return Response.json(
                {
                    success: false,
                    message: "Tag ID is required."
                },
                {
                    status: 400
                }
            );
        }

        const result = await Tag.deleteOne({ _id: tagId });

        if (result.deletedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Tag not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Tag deleted successfully.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while deleting tag : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while tag",
                error
            },
            {
                status: 500
            }
        );
    }
}