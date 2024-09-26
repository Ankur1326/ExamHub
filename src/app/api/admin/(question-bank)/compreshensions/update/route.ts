import dbConnect from "@/lib/dbConnect";
import Compreshension from "@/model/Comprehension";
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
        const compreshensionId = _id;

        if (!compreshensionId) {
            return Response.json(
                {
                    success: false,
                    message: "compreshension is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new title is already taken
        const existingCompreshension: any = await Compreshension.findOne({ title });
        if (existingCompreshension && existingCompreshension._id.toString() !== compreshensionId) {
            return Response.json(
                {
                    success: false,
                    message: "Compreshension with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the tag by ID and update it
        const updateCompreshension = await Compreshension.findByIdAndUpdate(
            compreshensionId,
            { title, body, isActive },
            { new: true, runValidators: true }
        );

        if (!updateCompreshension) {
            return Response.json(
                {
                    success: false,
                    message: "Compreshension not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Compreshension updated successfully",
                data: updateCompreshension
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while deleting compreshension : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while compreshension",
                error
            },
            {
                status: 500
            }
        );
    }
}