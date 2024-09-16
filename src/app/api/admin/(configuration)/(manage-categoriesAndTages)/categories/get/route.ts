import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Categories";
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
    const isActive = url.searchParams.get("isActive");
    const currentPage = parseInt(url.searchParams.get("currentPage") || "1", 10);  // Default to page 1 if not provided
    const name = url.searchParams.get("name") || "";
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10); // Default to 5 items per page

    try {
        // console.log(name, isActive, currentPage, itemsPerPage);

        let filter: any = {};

        // If `isActive` is provided, add it to the filter
        if (isActive !== null) {
            const isActiveBoolean = isActive === 'true';
            filter = { isActive: isActiveBoolean };
        }

        // Filter by `name` if provided (case-insensitive, partial match)
        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }

        const skip = (currentPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        // Fetch categories based on filter and pagination
        const categories = await Category.find(filter).skip(skip).limit(limit).exec();
        const totalCategories = await Category.countDocuments(filter).exec();

        if (!categories) {
            return Response.json(
                {
                    success: false,
                    message: "Categories not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Categories fetched successfully",
                data: {
                    categories,
                    totalCategories,
                    currentPage,
                    totalPages: Math.ceil(totalCategories / itemsPerPage)
                }
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while fetching categories: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching categories",
                error
            },
            {
                status: 500
            }
        );
    }
}