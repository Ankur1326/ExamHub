import dbConnect from "@/lib/dbConnect";
import Section from "@/model/Section";
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
        const { _id, name, shortDescription, isActive } = await request.json();
        console.log(_id, name, shortDescription, isActive);
        const sectionId = _id;

        if (!sectionId) {
            return Response.json(
                {
                    success: false,
                    message: "sectionId is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new name is already taken
        const existingSection: any = await Section.findOne({ name });
        if (existingSection && existingSection._id.toString() !== sectionId) {
            return Response.json(
                {
                    success: false,
                    message: "Section with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { name, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedSection) {
            return Response.json(
                {
                    success: false,
                    message: "Section not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Section updated successfully",
                data: updatedSection
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while deleting section : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while section",
                error
            },
            {
                status: 500
            }
        );
    }
}