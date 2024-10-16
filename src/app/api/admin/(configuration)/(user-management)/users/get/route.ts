import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
// import { getSession } from "next-auth/react";

export async function GET(request: Request) {
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
    const url = new URL(request.url)
    const currentPage = parseInt(url.searchParams.get("currentPage") || "1", 10);
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10); // Default to 5 items per page
    const username = url.searchParams.get("username") || "";

    try {

        let filter: any = {};

        if (username) {
            filter.username = { $regex: username, $options: 'i' };
        }

        // Fetch users with pagination
        const users = await UserModel.find(filter)
            .select("-password -resetPasswordToken -resetPasswordExpires -verifyCode -verifyCodeExpiry") // Exclude sensitive fields
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const totalUsers = await UserModel.countDocuments(filter);

        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        if (!users.length) {
            return Response.json(
                {
                    success: false,
                    message: "No users found",
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Users successfully fetched with pagination",
                data: {
                    users,
                    currentPage,
                    totalPages,
                    totalUsers,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("Error while fetching items: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching items",
                error
            },
            {
                status: 500
            }
        );
    }
}