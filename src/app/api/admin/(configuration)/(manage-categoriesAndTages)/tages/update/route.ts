import dbConnect from "@/lib/dbConnect";
import Tag from "@/model/Tag";
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
        const { _id, name, isActive } = await request.json();
        // console.log(_id, newName, description, content, isActive);
        const tagId = _id;

        if (!tagId) {
            return Response.json(
                {
                    success: false,
                    message: "tagId is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new name is already taken
        const existingTag: any = await Tag.findOne({ name });
        if (existingTag && existingTag._id.toString() !== tagId) {
            return Response.json(
                {
                    success: false,
                    message: "Tag with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updatedTag = await Tag.findByIdAndUpdate(
            tagId,
            { name, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedTag) {
            return Response.json(
                {
                    success: false,
                    message: "Tag not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "tag updated successfully",
                data: updatedTag
            },
            {
                status: 200
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