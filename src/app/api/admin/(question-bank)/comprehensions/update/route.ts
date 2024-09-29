import dbConnect from "@/lib/dbConnect";
import Comprehension from "@/model/Comprehension";
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
        const { _id, title, body, isActive } = await request.json();
        console.log(_id, title, body, isActive);
        const comprehensionId = _id;

        if (!comprehensionId) {
            return Response.json(
                {
                    success: false,
                    message: "comprehension is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new title is already taken
        const existingComprehension: any = await Comprehension.findOne({ title });
        if (existingComprehension && existingComprehension._id.toString() !== comprehensionId) {
            return Response.json(
                {
                    success: false,
                    message: "Comprehension with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updateComprehension = await Comprehension.findByIdAndUpdate(
            comprehensionId,
            { title, body, isActive },
            { new: true, runValidators: true }
        );

        if (!updateComprehension) {
            return Response.json(
                {
                    success: false,
                    message: "Comprehension not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Comprehension updated successfully",
                data: updateComprehension
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while deleting comprehension : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while comprehension",
                error
            },
            {
                status: 500
            }
        );
    }
}