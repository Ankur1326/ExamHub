import dbConnect from "@/lib/dbConnect";
import Skill from "@/model/Skill";
import Topic from "@/model/Topic";
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
        const { name, skillName, shortDescription, isActive } = await request.json();

        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Topic name is required."
                },
                {
                    status: 400
                }
            );
        }
        if (!skillName) {
            return Response.json(
                {
                    success: false,
                    message: "Please select a Skill"
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by name
        const existingTopic = await Topic.findOne({ name });
        // console.log("existingTopic : ", existingTopic);

        if (existingTopic) {
            return Response.json(
                {
                    success: true,
                    message: "Topic with this name already exists",
                },
                { status: 400 }
            )
        }

        const skill: any = await Skill.findOne({ name: skillName }) || ""

        if (!skill) {
            return Response.json(
                {
                    success: false,
                    message: "Crosponding Skill is not found",
                },
                { status: 400 }
            )
        }

        // Create a new topic with section details
        const newTopic = new Topic({
            name,
            shortDescription,
            isActive,
            skillId: skill._id.toString(),
            skillDetails: {
                name: skill.name,
                createdAt: skill.createdAt
            }
        });

        // console.log("newTopic : ", newTopic);

        // Save the new Topic to the database
        await newTopic.save();

        return Response.json(
            {
                success: true,
                message: "Topic successfully created",
                data: newTopic,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new Topic : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new Topic",
                error
            },
            {
                status: 500
            }
        );
    }
}