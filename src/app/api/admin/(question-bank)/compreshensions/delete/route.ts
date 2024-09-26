import dbConnect from "@/lib/dbConnect";
import Compreshension from "@/model/Comprehension";
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
        const compreshensionId = data._id

        // Fixing validation to check for undefined for isActive
        if (!compreshensionId) {
            return Response.json(
                {
                    success: false,
                    message: "Compreshension ID is required."
                },
                {
                    status: 400
                }
            );
        }

        const result = await Compreshension.deleteOne({ _id: compreshensionId });
        // console.log("result : ", result);

        if (result.deletedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Compreshension is not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Compreshension deleted successfully.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while deleting Compreshension : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while Compreshension",
                error
            },
            {
                status: 500
            }
        );
    }
}