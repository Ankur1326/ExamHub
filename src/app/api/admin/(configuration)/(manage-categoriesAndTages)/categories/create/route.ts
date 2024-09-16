import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Category";
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
        const { name, isActive, description = "", content = "" } = await request.json();
        console.log(name, isActive, description, content);

        // Fixing validation to check for undefined for isActive
        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Category name are required."
                },
                {
                    status: 400
                }
            );
        }

        // Check if the category already exists by name
        const existingCategory = await Category.findOne({ name });
        console.log("existingCategory : ", existingCategory);


        if (existingCategory) {
            return Response.json(
                {
                    success: true,
                    message: "Category with this name already exists",
                },
                { status: 400 }
            )
        }

        const newCategory = new Category({
            name,
            isActive,
            description,
            content
        });

        // Save the new category to the database
        await newCategory.save();

        return Response.json(
            {
                success: true,
                message: "Question tag created successfully",
                data: newCategory,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new caterory : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new caterory",
                error
            },
            {
                status: 500
            }
        );
    }
}