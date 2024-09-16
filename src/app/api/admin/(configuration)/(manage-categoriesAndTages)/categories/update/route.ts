import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Categories";
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
        const { _id, name, description, content, isActive } = await request.json();
        // console.log(_id, newName, description, content, isActive);
        const categoryId = _id;

        if (!categoryId) {
            return Response.json(
                {
                    success: false,
                    message: "categoryId is required",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if the new name is already taken
        const existingCategory: any = await Category.findOne({ name });
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            return Response.json(
                {
                    success: false,
                    message: "Category with this name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // Find the category by ID and update it
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, description, content, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return Response.json(
                {
                    success: false,
                    message: "Category not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Category updated successfully",
                data: updatedCategory
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while deleting caterory : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while category",
                error
            },
            {
                status: 500
            }
        );
    }
}