import dbConnect from "@/lib/dbConnect";
import ConfigurationModel from "@/model/Configuration";
// import { getSession } from "next-auth/react";

export async function GET(request: Request) {
    await dbConnect();

    const url = new URL(request.url);
    const activeParam = url.searchParams.get("isActive");

    try {
        // Fetch the configuration document for 'questionTypes'
        const configuration = await ConfigurationModel.findOne(
            { documentType: 'questionTypes' },
        );

        if (!configuration) {
            return Response.json(
                {
                    success: false,
                    message: "Configration is not found"
                },
                {
                    status: 404
                }
            );
        }

        const questionTypes = configuration.questionTypes

        if (!questionTypes) {
            return Response.json(
                {
                    success: false,
                    message: "Question types is not found"
                },
                {
                    status: 404
                }
            );
        }

        if (activeParam === 'true') {
            const activeQuestionTypes = questionTypes?.filter(questionType => questionType.isActive === true)
            // console.log("activeQuestionTypes : ", activeQuestionTypes);

            return Response.json(
                {
                    success: true,
                    message: "Active Question types fetched successfully",
                    data: activeQuestionTypes
                },
                {
                    status: 200
                }
            );
        } else {
            // console.log("questionTypes : ", questionTypes);
            return Response.json(
                {
                    success: true,
                    message: "All Question types fetched successfully",
                    data: questionTypes
                },
                {
                    status: 200
                }
            );
        }

    } catch (error) {
        console.log("Error while creating new question type : ", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error while fetching question types",
            },
            {
                status: 500
            }
        );
    }
}