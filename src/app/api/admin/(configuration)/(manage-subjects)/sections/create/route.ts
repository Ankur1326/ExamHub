import dbConnect from "@/lib/dbConnect";
import Section from "@/model/Section";
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
        const { name, shortDescription, isActive } = await request.json();
        console.log(name, shortDescription, isActive);

        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Section name is required."
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by name
        const existingSection = await Section.findOne({ name });
        // console.log("existingSection : ", existingSection);

        if (existingSection) {
            return Response.json(
                {
                    success: true,
                    message: "Section with this name already exists",
                },
                { status: 400 }
            )
        }

        const newSection = new Section({
            name,
            shortDescription,
            isActive,
        });

        // Save the new tag to the database
        await newSection.save();

        return Response.json(
            {
                success: true,
                message: "Section successfully created",
                data: newSection,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new Section : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new Section",
                error
            },
            {
                status: 500
            }
        );
    }
}