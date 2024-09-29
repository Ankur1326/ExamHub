import dbConnect from "@/lib/dbConnect";
import Comprehension from "@/model/Comprehension";
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
                    message: "Comprehension title is required."
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
        const existingComprehension = await Comprehension.findOne({ title });
        // console.log("existingComrehension : ", existingComprehension);

        if (existingComprehension) {
            return Response.json(
                {
                    success: true,
                    message: "Comprehension with this title already exists",
                },
                { status: 400 }
            )
        }

        const newComprehension = new Comprehension({
            title,
            body,
            isActive,
        });

        // Save the new tag to the database
        await newComprehension.save();
        return Response.json(
            {
                success: true,
                message: "Compreshension successfully created",
                data: newComprehension,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new Comprehension: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new Comprehension",
                error
            },
            {
                status: 500
            }
        );
    }
}