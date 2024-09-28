import dbConnect from "@/lib/dbConnect";
import Compreshension from "@/model/Comprehension";
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
    const title = url.searchParams.get("title") || "";
    const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "5", 10); // Default to 5 items per page
    const fetchAll = url.searchParams.get("fetchAll") === 'true'; // Check if fetchAll is true

    try {
        console.log(title, isActive, currentPage, itemsPerPage);

        let filter: any = {};

        // If `isActive` is provided, add it to the filter
        if (isActive !== null) {
            const isActiveBoolean = isActive === 'true';
            filter = { isActive: isActiveBoolean };
        }

        // Filter by `title` if provided (case-insensitive, partial match)
        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        let compreshensions;
        let totalCompreshensions;

        if (fetchAll) {
            compreshensions = await Compreshension.find(filter).exec();
            totalCompreshensions = compreshensions.length;
        } else {
            // Apply pagination when fetchAll is false or not provided
            const skip = (currentPage - 1) * itemsPerPage;
            const limit = itemsPerPage;
            
            compreshensions = await Compreshension.find(filter).skip(skip).limit(limit).exec();
            totalCompreshensions = await Compreshension.countDocuments(filter).exec();
        }
        console.log("compreshensions : ", compreshensions);
        

        if (!compreshensions) {
            return Response.json(
                {
                    success: false,
                    message: "compreshension not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Compreshensions fetched successfully",
                data: {
                    compreshensions,
                    totalCompreshensions,
                    currentPage,
                    totalPages: Math.ceil(totalCompreshensions / itemsPerPage)
                }
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while fetching compreshension: ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching compreshensions",
                error
            },
            {
                status: 500
            }
        );
    }
}