import dbConnect from "@/lib/dbConnect";
import Section from "@/model/Section";
import Skill from "@/model/Skill";
import Topic from "@/model/Topic";
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
        const { _id, name, skillName, shortDescription, isActive } = await request.json();
        console.log(_id, name, skillName, shortDescription, isActive);
        const topicId = _id;

        if (!topicId) {
            return Response.json(
                {
                    success: false,
                    message: "Skill id is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new name is already taken
        const existingTopic: any = await Topic.findOne({ name });
        if (existingTopic && existingTopic._id.toString() !== topicId) {
            return Response.json(
                {
                    success: false,
                    message: "Topic with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updatedTopic = await Topic.findByIdAndUpdate(
            topicId,
            { name, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedTopic) {
            return Response.json(
                {
                    success: false,
                    message: "Topic not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Topic updated successfully",
                data: updatedTopic
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while deleting topic : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while topic",
                error
            },
            {
                status: 500
            }
        );
    }
}