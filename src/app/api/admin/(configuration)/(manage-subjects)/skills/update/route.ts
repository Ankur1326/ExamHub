import dbConnect from "@/lib/dbConnect";
import Section from "@/model/Section";
import Skill from "@/model/Skill";
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
        const { _id, name, sectionName, shortDescription, isActive } = await request.json();
        console.log(_id, name, sectionName, shortDescription, isActive);
        const skillId = _id;

        if (!skillId) {
            return Response.json(
                {
                    success: false,
                    message: "skillId is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new name is already taken
        const existingSkill: any = await Skill.findOne({ name });
        if (existingSkill && existingSkill._id.toString() !== skillId) {
            return Response.json(
                {
                    success: false,
                    message: "Skill with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updatedSkill = await Skill.findByIdAndUpdate(
            skillId,
            { name, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedSkill) {
            return Response.json(
                {
                    success: false,
                    message: "Skill not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Skill updated successfully",
                data: updatedSkill
            },
            {
                status: 200
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