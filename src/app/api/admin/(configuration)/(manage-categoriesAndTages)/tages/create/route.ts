import dbConnect from "@/lib/dbConnect";
import Tag from "@/model/Tag";
// import { getSession } from "next-auth/react";

export async function POST(request: Request) {
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
        const { name, isActive } = await request.json();
        console.log(name, isActive);

        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Tag name is required."
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by name
        const existingTag = await Tag.findOne({ name });
        console.log("existingTag : ", existingTag);


        if (existingTag) {
            return Response.json(
                {
                    success: true,
                    message: "Tag with this name already exists",
                },
                { status: 400 }
            )
        }

        const newTag = new Tag({
            name,
            isActive,
        });

        // Save the new tag to the database
        await newTag.save();

        return Response.json(
            {
                success: true,
                message: "Tag successfully created",
                data: newTag,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new tag : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new tag",
                error
            },
            {
                status: 500
            }
        );
    }
}