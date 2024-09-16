import dbConnect from "@/lib/dbConnect";
import Section from "@/model/Section";
import Skill from "@/model/Skill";
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
        const { name, sectionName, shortDescription, isActive } = await request.json();
        console.log(name, sectionName, shortDescription, isActive);

        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Skill name is required."
                },
                {
                    status: 400
                }
            );
        }
        if (!sectionName) {
            return Response.json(
                {
                    success: false,
                    message: "Select a Section"
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by name
        const existingSkill = await Skill.findOne({ name });
        // console.log("existingSkill : ", existingSkill);

        if (existingSkill) {
            return Response.json(
                {
                    success: true,
                    message: "Skill with this name already exists",
                },
                { status: 400 }
            )
        }

        const section: any = await Section.findOne({ name: sectionName }) || ""

        if (!section) {
            return Response.json(
                {
                    success: false,
                    message: "Crosponding Section is not found",
                },
                { status: 400 }
            )
        }

        // Create a new skill with section details
        const newSkill = new Skill({
            name,
            shortDescription,
            isActive,
            sectionId: section._id.toString(),
            sectionDetails: {
                name: section.name,
                createdAt: section.createdAt
            }
        });

        console.log("newSkill : ", newSkill);

        // Save the new skill to the database
        await newSkill.save();

        return Response.json(
            {
                success: true,
                message: "Skill successfully created",
                data: newSkill,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new Skill : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new Skill",
                error
            },
            {
                status: 500
            }
        );
    }
}