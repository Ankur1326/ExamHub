import dbConnect from "@/lib/dbConnect";
import Skill from "@/model/Skill";
import Topic from "@/model/Topic";
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
        const skillId = data._id


        // Fixing validation to check for undefined for isActive
        if (!skillId) {
            return Response.json(
                {
                    success: false,
                    message: "Skill ID is required."
                },
                {
                    status: 400
                }
            );
        }

        const associateTopics = await Topic.findOne({skillId})

        if (associateTopics) {
            return Response.json(
                {
                    success: false,
                    message: "Unable to Delete Skill . Remove all associate Topics first",
                },
                {
                    status: 404,
                }
            );
        }
        
        const result = await Skill.deleteOne({ _id: skillId });

        if (result.deletedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Skill is not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Skill deleted successfully.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while deleting skill : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while skill",
                error
            },
            {
                status: 500
            }
        );
    }
}