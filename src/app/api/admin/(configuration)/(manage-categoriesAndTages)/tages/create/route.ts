import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";
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
        const { tagName, isActive } = await request.json();
        // console.log(tagName, isActive);

        // Fixing validation to check for undefined for isActive
        if (!tagName || isActive === undefined) {
            return Response.json(
                {
                    success: false,
                    message: "Tag name and isActive are required."
                },
                {
                    status: 400
                }
            );
        }

        // Find the document and check if the tag already exists
        const existingConfig = await ConfigurationModel.findOne({
            documentType: 'questionTags',
            'questionTags.tagName': tagName
        });

        if (existingConfig) {
            return Response.json(
                {
                    success: false,
                    message: "Tag already exists."
                },
                {
                    status: 409 // Conflict
                }
            );
        }

        const configuration = await ConfigurationModel.findOneAndUpdate(
            { documentType: 'questionTags' },
            {
                $push: {
                    questionTags: {
                        $each: [{ tagName, isActive }],
                        $position: 0 // Add the new tag at the first position
                    }
                }
            },
            { new: true, upsert: true }
        );

        const createdTag = configuration?.questionTags?.find(
            item => item.tagName === tagName && item.isActive === isActive
        );

        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "configuration not found",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Question tag created successfully",
                data: createdTag,
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new question tag : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new question tag",
                error
            },
            {
                status: 500
            }
        );
    }
}
``