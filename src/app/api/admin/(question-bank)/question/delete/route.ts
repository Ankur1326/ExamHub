import dbConnect from "@/lib/dbConnect";
import Question from "@/model/Question";
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
        const questionId = data._id

        if (!questionId) {
            return Response.json(
                {
                    success: false,
                    message: "Question ID is required."
                },
                {
                    status: 400
                }
            );
        }

        const result = await Question.deleteOne({ _id: questionId });
        // console.log("result : ", result);

        if (result.deletedCount === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Question is not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Question deleted successfully.",
            },
            {
                status: 200,
            }
        );

    } catch (error) {
        console.log("Error while deleting Question : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while Question",
                error
            },
            {
                status: 500
            }
        );
    }
}