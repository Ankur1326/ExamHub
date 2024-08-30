import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

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
        const { typeName, description, code } = await request.json()
        console.log(typeName, description, code);

        if (!typeName || !code) {
            return Response.json(
                {
                    success: false,
                    message: "Type name and code are required."
                },
                {
                    status: 400
                }
            )
        }

        const configuration = await ConfigurationModel.findOneAndUpdate(
            { documentType: 'questionTypes' }, // Match the document type
            { 
                $push: { 
                    questionTypes: { 
                        typeName, 
                        description: description || '', 
                        code, 
                        isActive: true 
                    } 
                } 
            },
            { new: true, upsert: true }
        );

        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "configuration not found"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Question type created successfully",
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.log("Error while creating new question type : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while creating new question type",
                error
            },
            {
                status: 500
            }
        );
    }
}