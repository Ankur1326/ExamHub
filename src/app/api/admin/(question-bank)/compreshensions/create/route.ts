import dbConnect from "@/lib/dbConnect";
import Compreshension from "@/model/Comprehension";
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
        const { title, body, isActive } = await request.json();
        // console.log(title, body, isActive);

        if (!title) {
            return Response.json(
                {
                    success: false,
                    message: "Compreshension title is required."
                },
                {
                    status: 400
                }
            );
        }

        if (!body) {
            return Response.json(
                {
                    success: false,
                    message: "body is required."
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by title
        const existingCompreshension = await Compreshension.findOne({ title });
        // console.log("existingComreshension : ", existingCompreshension);

        if (existingCompreshension) {
            return Response.json(
                {
                    success: true,
                    message: "Compreshension with this title already exists",
                },
                { status: 400 }
            )
        }

        const newCompreshension = new Compreshension({
            title,
            body,
            isActive,
        });

        // Save the new tag to the database
        await newCompreshension.save();
        return Response.json(
            {
                success: true,
                message: "Compreshension successfully created",
                data: newCompreshension,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new Compreshension: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new Compreshension",
                error
            },
            {
                status: 500
            }
        );
    }
}